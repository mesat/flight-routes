package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

  private final TransportationRepository transportationRepository;
  private final LocationRepository locationRepository;

  @Cacheable(
      value = "routes",
      key =
          "'origin_' + #request.originLocationCode + '_dest_' + #request.destinationLocationCode + '_date_' + #request.date")
  @Transactional(readOnly = true)
  public List<RouteDTO> findRoutes(RouteRequestDTO request) {
    // Lokasyonları bul
    Location originLocation =
        locationRepository
            .findByLocationCode(request.getOriginLocationCode())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Origin location not found: " + request.getOriginLocationCode()));
    List<Location> originAirports;
    List<Location> destinationAirports;

    Location destinationLocation =
        locationRepository
            .findByLocationCode(request.getDestinationLocationCode())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Destination location not found: " + request.getDestinationLocationCode()));

    if (originLocation.getLocationCode().equalsIgnoreCase(destinationLocation.getLocationCode())) {
      throw new IllegalArgumentException("Origin and destination cannot be the same");
    }

    boolean isOriginAnAirport = originLocation.getLocationCode().length() == 3;
    boolean isDestinationAnAirport = destinationLocation.getLocationCode().length() == 3;

    List<Transportation> before, flights, after;

    originAirports =
        isOriginAnAirport
            ? List.of(originLocation)
            : locationRepository.findByCity(originLocation.getCity()).stream()
                .filter(location -> location.getLocationCode().length() == 3)
                .collect(Collectors.toList());
    destinationAirports =
        isDestinationAnAirport
            ? List.of(destinationLocation)
            : locationRepository.findByCity(destinationLocation.getCity()).stream()
                .filter(location -> location.getLocationCode().length() == 3)
                .collect(Collectors.toList());

    // 1) Sadece uçuş içeren (doğrudan uçuş) rota
    flights = addDirectFlights(originAirports, destinationAirports, request.getDate());
    List<RouteDTO> routes = new ArrayList<>();

    // 2) Rota: Uçuş öncesi şehir içi ulaşım -> Uçuş
    before =
        addRoutesWithBeforeFlight(originLocation, request.getDate()).stream()
            .filter(
                transportation ->
                    transportation.getDestinationLocation().getLocationCode().length() == 3)
            .toList();
    // 3) Rota: Uçuş -> Uçuş sonrası şehir içi ulaşım
    after =
        addRoutesWithAfterFlight(destinationLocation, request.getDate()).stream()
            .filter(
                transportation ->
                    transportation.getOriginLocation().getLocationCode().length() == 3)
            .toList();
    // 4) Rota: Uçuş öncesi şehir içi ulaşım -> Uçuş -> Uçuş sonrası şehir içi ulaşım

    for (Transportation flight : flights) {
      calculateRouteMatrix(
          routes,
          originLocation,
          destinationLocation,
          before.stream()
              .filter(b -> b.getDestinationLocation().equals(flight.getOriginLocation()))
              .toList(),
          flight,
          after.stream()
              .filter(b -> b.getOriginLocation().equals(flight.getDestinationLocation()))
              .toList());
    }

    // Hibernate oturumundan bağımsız deep copy'ler oluştur
    return routes.stream().map(RouteDTO::deepCopy).collect(Collectors.toList());
  }

  /**
   * Belirtilen tarihte rota bulunamadığında, alternatif günlerde seferler olup olmadığını kontrol eder.
   */
  @Transactional(readOnly = true)
  public List<Integer> findAlternativeDays(RouteRequestDTO request) {
    // Lokasyonları bul
    Location originLocation =
        locationRepository
            .findByLocationCode(request.getOriginLocationCode())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Origin location not found: " + request.getOriginLocationCode()));

    Location destinationLocation =
        locationRepository
            .findByLocationCode(request.getDestinationLocationCode())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Destination location not found: " + request.getDestinationLocationCode()));

    if (originLocation.getLocationCode().equalsIgnoreCase(destinationLocation.getLocationCode())) {
      return new ArrayList<>();
    }

    boolean isOriginAnAirport = originLocation.getLocationCode().length() == 3;
    boolean isDestinationAnAirport = destinationLocation.getLocationCode().length() == 3;

    List<Location> originAirports =
        isOriginAnAirport
            ? List.of(originLocation)
            : locationRepository.findByCity(originLocation.getCity()).stream()
                .filter(location -> location.getLocationCode().length() == 3)
                .collect(Collectors.toList());
    List<Location> destinationAirports =
        isDestinationAnAirport
            ? List.of(destinationLocation)
            : locationRepository.findByCity(destinationLocation.getCity()).stream()
                .filter(location -> location.getLocationCode().length() == 3)
                .collect(Collectors.toList());

    // Yeni sorgu ile operating days'leri al
    List<Integer> availableDays = transportationRepository
        .findOperatingDaysByOriginLocationsAndDestinationLocationsAndTransportationType(
            originAirports,
            destinationAirports,
            Transportation.TransportationType.FLIGHT
        );

    // İstenen günü çıkar
    int requestedDay = request.getDate().getDayOfWeek().getValue();
    availableDays.remove(Integer.valueOf(requestedDay));

    return availableDays;
  }

  /** Doğrudan uçuşu ekler. Geçerli: FLIGHT */
  private List<Transportation> addDirectFlights(
      List<Location> originLocation, List<Location> destinationLocation, LocalDate date) {
    return transportationRepository
        .findByOriginLocationInAndDestinationLocationInAndTransportationTypeAndOperatingDaysContaining(
            originLocation,
            destinationLocation,
            Transportation.TransportationType.FLIGHT,
            date.getDayOfWeek().getValue());
  }

  /**
   * Rota: [Şehir içi ulaşım] -> [Uçuş] Kurallar: - İlk ulaşım uçuş dışı (ör. UBER, BUS vb.) olmak
   * zorunda. - Bu ulaşım, başlangıç lokasyonundan hareket etmeli ve aynı şehir içinde kalmalı. -
   * Ardından, uçuşun kalkış lokasyonu, ilk ulaşımın varış lokasyonuyla (şehir bazında) eşleşmeli ve
   * uçuş rota hedefi ile bitmelidir.
   */
  private List<Transportation> addRoutesWithBeforeFlight(Location originLocation, LocalDate date) {
    // Şimdi, before ulaşımın varış noktasından kalkacak, route hedefine giden bir uçuş ara
    if (originLocation.getLocationCode().length() == 3) {
      return new ArrayList<>();
    }
    return transportationRepository
        .findByOriginLocationAndTransportationTypeNotAndOperatingDaysContaining(
            originLocation,
            Transportation.TransportationType.FLIGHT,
            date.getDayOfWeek().getValue());
  }

  /**
   * Rota: [Uçuş] -> [Şehir içi ulaşım] Kurallar: - İlk aşama uçuş olmalı ve route’un başlangıç
   * lokasyonundan kalkmalı. - Ardından, uçuşun varış noktasından hareket eden, şehir içi olan bir
   * ulaşım, uçuşun varış noktasının şehri ile destination'ın şehrinin eşleşmesi şartıyla bulunmalı.
   */
  private List<Transportation> addRoutesWithAfterFlight(
      Location destinationLocation, LocalDate date) {
    if (destinationLocation.getLocationCode().length() == 3) {
      return new ArrayList<>();
    }
    return transportationRepository
        .findByDestinationLocationAndTransportationTypeNotAndOperatingDaysContaining(
            destinationLocation,
            Transportation.TransportationType.FLIGHT,
            date.getDayOfWeek().getValue());
  }

  /**
   * Rota: [Şehir içi ulaşım] -> [Uçuş] -> [Şehir içi ulaşım] Kurallar: - İlk adımda, origin'den
   * intra-city (uçuş öncesi) transfer yapılmalı. - Ardından, ilk transferin varış noktasının şehri
   * ile eşleşen bir uçuş, route hedefi ile biten segmenti oluşturmalı. - Son adımda, uçuşun varış
   * noktasından, destination'a giden intra-city transfer eklenmeli.
   */
  private void calculateRouteMatrix(
      List<RouteDTO> routes,
      Location originLocation,
      Location destinationLocation,
      List<Transportation> before,
      Transportation flight,
      List<Transportation> after) {
    int beforeSizeNormalized = Integer.max(before.size(), 1);
    int afterSizeNormalized = Integer.max(after.size(), 1);
    int totalSize = beforeSizeNormalized * afterSizeNormalized;

    for (int i = 0; i < totalSize; i++) {
      RouteDTO.RouteDTOBuilder routeBuilder =
          RouteDTO.builder()
              .flight(TransportationDTO.fromEntity(flight))
              .originLocationName(originLocation.getName())
              .destinationLocationName(destinationLocation.getName());
      if (!before.isEmpty()) {
        routeBuilder.beforeFlight(
            TransportationDTO.fromEntity(before.get(i % beforeSizeNormalized)));
      }
      if (!after.isEmpty()) {
        routeBuilder.afterFlight(
            TransportationDTO.fromEntity(after.get((i / beforeSizeNormalized))));
      }
      routes.add(routeBuilder.build());
    }
  }
}
