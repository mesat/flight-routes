package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteFinderService {
    private final TransportationRepository transportationRepository;

    /**
     * Bu metod, verilen origin ve destination lokasyonları için,
     * belirtilen gün (dayOfWeek: 1=Monday ... 7=Sunday) çalışan ulaşım seçeneklerinden,
     * iş kurallarına uygun geçerli rotaları (zorunlu 1 uçuş, opsiyonel şehir içi transferler) oluşturur.
     * *
     * * Kurallar:
     * - Rota mutlaka 1 adet uçuş (FLIGHT) içermelidir.
     * - Uçuş dışı transferler (ör. UBER, BUS, SUBWAY vs.) yalnızca şehir içi ulaşım olarak kullanılabilir.
     * - Farklı şehirler arası (intercity) transferlerde uçuş dışı seçenek kullanılamaz.
     * - Transfer segmentlerinde, transferin kalkış ve varış lokasyonlarının ait olduğu şehirler,
     *   ilgili uçuşun kalkış/varış lokasyonlarının şehirleriyle eşleşmelidir.
     *
     * @param origin Başlangıç lokasyonu.
     * @param destination Varış lokasyonu.
     * @param dayOfWeek Çalışma günü (1-7 arası, örn: 1 = Pazartesi).
     * @return Uygun rota kombinasyonlarının listesi.
     */
    public List<RouteDTO> findAllRoutes(Location origin, Location destination, int dayOfWeek) {
        List<RouteDTO> validRoutes = new ArrayList<>();

        // Öncelikle, belirtilen günde çalışan tüm uçuşları alıyoruz.
        List<Transportation> flights = transportationRepository.findByTransportationType(TransportationType.FLIGHT)
                .stream()
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                .toList();

        // Her uçuş için uygun rota kombinasyonlarını oluşturuyoruz.
        for (Transportation flight : flights) {
            // 1. Doğrudan uçuş: Uçuş kalkış noktası origin, varış noktası destination.
            if (flight.getOriginLocation().equals(origin) && flight.getDestinationLocation().equals(destination)) {
                validRoutes.add(new RouteDTO(
                        null,
                        mapToDTO(flight),
                        null,
                        origin.getName(),
                        destination.getName()
                ));
                continue;
            }

            // 2. Uçuş + Sadece ön transfer:
            //    Uçuşun varış noktası destination ise, origin'den uçuşun kalkış noktasına giden,
            //    şehir içi (non-flight) transfer arıyoruz.
            if (flight.getDestinationLocation().equals(destination)) {
                List<Transportation> beforeTransfers = findBeforeFlightTransfers(origin, flight, dayOfWeek);
                beforeTransfers.forEach(beforeTransfer ->
                        validRoutes.add(new RouteDTO(
                                mapToDTO(beforeTransfer),
                                mapToDTO(flight),
                                null,
                                origin.getName(),
                                destination.getName()
                        ))
                );
            }

            // 3. Uçuş + Sadece sonrası transfer:
            //    Uçuşun kalkış noktası origin ise, uçuşun varış noktasından destination'a giden,
            //    şehir içi (non-flight) transfer arıyoruz.
            if (flight.getOriginLocation().equals(origin)) {
                List<Transportation> afterTransfers = findAfterFlightTransfers(flight, destination, dayOfWeek);
                afterTransfers.forEach(afterTransfer ->
                        validRoutes.add(new RouteDTO(
                                null,
                                mapToDTO(flight),
                                mapToDTO(afterTransfer),
                                origin.getName(),
                                destination.getName()
                        ))
                );
            }

            // 4. Uçuş + Hem ön hem sonrası transfer:
            //    Uçuş ne origin ne de destination ile doğrudan eşleşmiyorsa,
            //    hem origin'den uçuşun kalkış noktasına hem de uçuşun varış noktasından destination'a giden transferleri arıyoruz.
            if (!flight.getOriginLocation().equals(origin) && !flight.getDestinationLocation().equals(destination)) {
                List<Transportation> beforeTransfers = findBeforeFlightTransfers(origin, flight, dayOfWeek);
                List<Transportation> afterTransfers = findAfterFlightTransfers(flight, destination, dayOfWeek);
                for (Transportation before : beforeTransfers) {
                    for (Transportation after : afterTransfers) {
                        validRoutes.add(new RouteDTO(
                                mapToDTO(before),
                                mapToDTO(flight),
                                mapToDTO(after),
                                origin.getName(),
                                destination.getName()
                        ));
                    }
                }
            }
        }

        return validRoutes;
    }

    /**
     * Origin lokasyonundan başlayıp, uçuşun kalkış noktasına (flight.getOriginLocation()) ulaşan,
     * uçuş dışı (non-flight) ve şehir içi transferleri bulur.
     * Karşılaştırma, Location nesnesinin equals metodu yerine, city alanı üzerinden yapılır.
     *
     * @param origin Başlangıç lokasyonu.
     * @param flight Uçuş segmenti.
     * @param dayOfWeek Çalışma günü.
     * @return Uygun ön transferler listesi.
     */
    private List<Transportation> findBeforeFlightTransfers(Location origin, Transportation flight, int dayOfWeek) {
        return transportationRepository.findAll()
                .stream()
                .filter(t -> t.getTransportationType() != TransportationType.FLIGHT) // yalnızca non-flight
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                // Transferin kalkış lokasyonunun ait olduğu şehir, origin'in şehriyle aynı olmalı.
                .filter(t -> t.getOriginLocation().getCity().equalsIgnoreCase(origin.getCity()))
                // Transferin varış lokasyonunun ait olduğu şehir, uçuşun kalkış lokasyonunun şehriyle aynı olmalı.
                .filter(t -> t.getDestinationLocation().getCity().equalsIgnoreCase(flight.getOriginLocation().getCity()))
                .collect(Collectors.toList());
    }

    /**
     * Uçuşun varış noktasından başlayıp, destination lokasyonuna giden,
     * uçuş dışı (non-flight) ve şehir içi transferleri bulur.
     * Karşılaştırma, Location nesnesinin equals metodu yerine, city alanı üzerinden yapılır.
     *
     * @param flight Uçuş segmenti.
     * @param destination Varış lokasyonu.
     * @param dayOfWeek Çalışma günü.
     * @return Uygun sonrası transferler listesi.
     */
    private List<Transportation> findAfterFlightTransfers(Transportation flight, Location destination, int dayOfWeek) {
        return transportationRepository.findAll()
                .stream()
                .filter(t -> t.getTransportationType() != TransportationType.FLIGHT) // yalnızca non-flight
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                // Transferin kalkış lokasyonunun ait olduğu şehir, uçuşun varış lokasyonunun şehriyle aynı olmalı.
                .filter(t -> t.getOriginLocation().getCity().equalsIgnoreCase(flight.getDestinationLocation().getCity()))
                // Transferin varış lokasyonunun ait olduğu şehir, destination'ın şehriyle aynı olmalı.
                .filter(t -> t.getDestinationLocation().getCity().equalsIgnoreCase(destination.getCity()))
                .collect(Collectors.toList());
    }

    /**
     * Transportation entity'sini TransportationDTO'ya çevirir.
     */
    private TransportationDTO mapToDTO(Transportation transportation) {
        if (transportation == null) return null;
        return new TransportationDTO(
                transportation.getId(),
                transportation.getOriginLocation().getId(),
                transportation.getDestinationLocation().getId(),
                transportation.getTransportationType(),
                transportation.getOperatingDays()
        );
    }
}