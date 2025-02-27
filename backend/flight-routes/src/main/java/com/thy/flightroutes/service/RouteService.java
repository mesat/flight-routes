package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
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

    @Cacheable(value = "routes", key = "'origin_' + #request.originLocationCode + '_dest_' + #request.destinationLocationCode + '_date_' + #request.date")
    @Transactional(readOnly = true)
    public List<RouteDTO> findRoutes(RouteRequestDTO request) {
        // Lokasyonları bul
        Location originLocation = locationRepository.findByLocationCode(request.getOriginLocationCode())
                .orElseThrow(() -> new IllegalArgumentException("Origin location not found: " + request.getOriginLocationCode()));

        Location destinationLocation = locationRepository.findByLocationCode(request.getDestinationLocationCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination location not found: " + request.getDestinationLocationCode()));

        // Tüm ulaşım seçeneklerini getir
        List<Transportation> allTransportations = transportationRepository.findAll();

        List<RouteDTO> routes = new ArrayList<>();

        // 1) Sadece uçuş içeren (doğrudan uçuş) rota
        addDirectFlights(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // 2) Rota: Uçuş öncesi şehir içi ulaşım -> Uçuş
        addRoutesWithBeforeFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // 3) Rota: Uçuş -> Uçuş sonrası şehir içi ulaşım
        addRoutesWithAfterFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // 4) Rota: Uçuş öncesi şehir içi ulaşım -> Uçuş -> Uçuş sonrası şehir içi ulaşım
        addRoutesWithBeforeAndAfterFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // Hibernate oturumundan bağımsız deep copy’ler oluştur
        return routes.stream()
                .map(RouteDTO::deepCopy)
                .collect(Collectors.toList());
    }

    /**
     * Doğrudan uçuşu ekler.
     * Geçerli: FLIGHT
     */
    private void addDirectFlights(List<RouteDTO> routes, List<Transportation> allTransportations,
                                  Location originLocation, Location destinationLocation, LocalDate date) {
        for (Transportation t : allTransportations) {
            if (isFlightBetweenLocations(t, originLocation, destinationLocation) && isAvailableOnDate(t, date)) {
                RouteDTO route = RouteDTO.builder()
                        .flight(TransportationDTO.fromEntity(t))
                        .originLocationName(originLocation.getName())
                        .destinationLocationName(destinationLocation.getName())
                        .build();
                routes.add(route);
            }
        }
    }

    /**
     * Rota: [Şehir içi ulaşım] -> [Uçuş]
     * Kurallar:
     * - İlk ulaşım uçuş dışı (ör. UBER, BUS vb.) olmak zorunda.
     * - Bu ulaşım, başlangıç lokasyonundan hareket etmeli ve aynı şehir içinde kalmalı.
     * - Ardından, uçuşun kalkış lokasyonu, ilk ulaşımın varış lokasyonuyla (şehir bazında) eşleşmeli
     *   ve uçuş rota hedefi ile bitmelidir.
     */
    private void addRoutesWithBeforeFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                           Location originLocation, Location destinationLocation, LocalDate date) {
        for (Transportation before : allTransportations) {
            // Uçuş dışı ulaşım seç
            if (before.getTransportationType() == Transportation.TransportationType.FLIGHT) {
                continue;
            }
            if (!isAvailableOnDate(before, date)) {
                continue;
            }
            // İlk ulaşım, route’un başlangıç lokasyonundan başlamalı
            if (!before.getOriginLocation().getId().equals(originLocation.getId())) {
                continue;
            }
            // Transferin intra-city olması gerekir
            if (!before.getOriginLocation().getCity().equalsIgnoreCase(before.getDestinationLocation().getCity())) {
                continue;
            }
            // Şimdi, before ulaşımın varış noktasından kalkacak, route hedefine giden bir uçuş ara
            for (Transportation flight : allTransportations) {
                if (flight.getTransportationType() != Transportation.TransportationType.FLIGHT) {
                    continue;
                }
                if (!isAvailableOnDate(flight, date)) {
                    continue;
                }
                // Bağlantı: Uçuşun kalkış noktasının şehri, before transferin varış noktasının şehriyle eşleşmeli
                // ve uçuşun varış noktası destination ile (ID üzerinden) eşleşmeli.
                if (flight.getOriginLocation().getCity().equalsIgnoreCase(before.getDestinationLocation().getCity()) &&
                        flight.getDestinationLocation().getId().equals(destinationLocation.getId())) {
                    RouteDTO route = RouteDTO.builder()
                            .beforeFlight(TransportationDTO.fromEntity(before))
                            .flight(TransportationDTO.fromEntity(flight))
                            .originLocationName(originLocation.getName())
                            .destinationLocationName(destinationLocation.getName())
                            .build();
                    routes.add(route);
                }
            }
        }
    }

    /**
     * Rota: [Uçuş] -> [Şehir içi ulaşım]
     * Kurallar:
     * - İlk aşama uçuş olmalı ve route’un başlangıç lokasyonundan kalkmalı.
     * - Ardından, uçuşun varış noktasından hareket eden, şehir içi olan bir ulaşım,
     *   uçuşun varış noktasının şehri ile destination'ın şehrinin eşleşmesi şartıyla bulunmalı.
     */
    private void addRoutesWithAfterFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                          Location originLocation, Location destinationLocation, LocalDate date) {
        for (Transportation flight : allTransportations) {
            if (flight.getTransportationType() != Transportation.TransportationType.FLIGHT) {
                continue;
            }
            if (!isAvailableOnDate(flight, date)) {
                continue;
            }
            // Uçuş, route'un başlangıç lokasyonundan kalkmalı
            if (!flight.getOriginLocation().getId().equals(originLocation.getId())) {
                continue;
            }
            // Uçuş sonrası, uçuşun varış noktasından route hedefine giden şehir içi ulaşım ara
            for (Transportation after : allTransportations) {
                if (after.getTransportationType() == Transportation.TransportationType.FLIGHT) {
                    continue;
                }
                if (!isAvailableOnDate(after, date)) {
                    continue;
                }
                // Transferin intra-city olduğundan emin ol
                if (!after.getOriginLocation().getCity().equalsIgnoreCase(after.getDestinationLocation().getCity())) {
                    continue;
                }
                // Bağlantı: Uçuşun varış noktasının şehri, after transferin kalkış noktasının şehriyle eşleşmeli
                // ve after transferin varış noktası destination ile (ID üzerinden) eşleşmeli.
                if (flight.getDestinationLocation().getCity().equalsIgnoreCase(after.getOriginLocation().getCity()) &&
                        after.getDestinationLocation().getId().equals(destinationLocation.getId())) {
                    RouteDTO route = RouteDTO.builder()
                            .flight(TransportationDTO.fromEntity(flight))
                            .afterFlight(TransportationDTO.fromEntity(after))
                            .originLocationName(originLocation.getName())
                            .destinationLocationName(destinationLocation.getName())
                            .build();
                    routes.add(route);
                }
            }
        }
    }

    /**
     * Rota: [Şehir içi ulaşım] -> [Uçuş] -> [Şehir içi ulaşım]
     * Kurallar:
     * - İlk adımda, origin'den intra-city (uçuş öncesi) transfer yapılmalı.
     * - Ardından, ilk transferin varış noktasının şehri ile eşleşen bir uçuş,
     *   route hedefi ile biten segmenti oluşturmalı.
     * - Son adımda, uçuşun varış noktasından, destination'a giden intra-city transfer eklenmeli.
     */
    private void addRoutesWithBeforeAndAfterFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                                   Location originLocation, Location destinationLocation, LocalDate date) {
        for (Transportation before : allTransportations) {
            if (before.getTransportationType() == Transportation.TransportationType.FLIGHT) {
                continue;
            }
            if (!isAvailableOnDate(before, date)) {
                continue;
            }
            // Before transfer, origin'den başlamalı ve intra-city olmalı
            if (!before.getOriginLocation().getId().equals(originLocation.getId())) {
                continue;
            }
            if (!before.getOriginLocation().getCity().equalsIgnoreCase(before.getDestinationLocation().getCity())) {
                continue;
            }
            for (Transportation flight : allTransportations) {
                if (flight.getTransportationType() != Transportation.TransportationType.FLIGHT) {
                    continue;
                }
                if (!isAvailableOnDate(flight, date)) {
                    continue;
                }
                // Bağlantı: Uçuşun kalkış noktasının şehri, before transferin varış noktasının şehriyle eşleşmeli
                if (!flight.getOriginLocation().getCity().equalsIgnoreCase(before.getDestinationLocation().getCity())) {
                    continue;
                }
                for (Transportation after : allTransportations) {
                    if (after.getTransportationType() == Transportation.TransportationType.FLIGHT) {
                        continue;
                    }
                    if (!isAvailableOnDate(after, date)) {
                        continue;
                    }
                    if (!after.getOriginLocation().getCity().equalsIgnoreCase(after.getDestinationLocation().getCity())) {
                        continue;
                    }
                    // Bağlantı: Uçuşun varış noktasının şehri, after transferin kalkış noktasının şehriyle eşleşmeli
                    // ve after transferin varış noktası destination ile (ID üzerinden) eşleşmeli.
                    if (flight.getDestinationLocation().getCity().equalsIgnoreCase(after.getOriginLocation().getCity()) &&
                            after.getDestinationLocation().getId().equals(destinationLocation.getId())) {
                        RouteDTO route = RouteDTO.builder()
                                .beforeFlight(TransportationDTO.fromEntity(before))
                                .flight(TransportationDTO.fromEntity(flight))
                                .afterFlight(TransportationDTO.fromEntity(after))
                                .originLocationName(originLocation.getName())
                                .destinationLocationName(destinationLocation.getName())
                                .build();
                        routes.add(route);
                    }
                }
            }
        }
    }

    /**
     * Kontrol: Ulaşım tipi FLIGHT olup, kalkış ve varış lokasyonları route gereksinimine uygun mu?
     */
    private boolean isFlightBetweenLocations(Transportation transportation, Location origin, Location destination) {
        return transportation.getTransportationType() == Transportation.TransportationType.FLIGHT &&
                transportation.getOriginLocation().getId().equals(origin.getId()) &&
                transportation.getDestinationLocation().getId().equals(destination.getId());
    }

    /**
     * Ulaşımın, verilen tarihte işletim günleri içerisinde olup olmadığını kontrol eder.
     * (Örn: operatingDays bir Set<Integer> olup, Pazartesi=1 ... Pazar=7 şeklinde tanımlanmıştır)
     */
    private boolean isAvailableOnDate(Transportation transportation, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1-7 (Monday-Sunday)
        return transportation.getOperatingDays().contains(dayOfWeek);
    }
}