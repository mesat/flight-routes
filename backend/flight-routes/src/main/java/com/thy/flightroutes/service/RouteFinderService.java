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

    public List<RouteDTO> findAllRoutes(Location origin, Location destination, int dayOfWeek) {
        List<RouteDTO> validRoutes = new ArrayList<>();

        // Get all flights for the given day
        List<Transportation> flights = transportationRepository.findByTransportationType(TransportationType.FLIGHT)
                .stream()
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                .collect(Collectors.toList());

        // For each flight, try to create valid routes
        for (Transportation flight : flights) {
            // Direct flight
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

            // Flight with before/after transfers
            if (flight.getOriginLocation().equals(origin)) {
                // Try to find after flight transfers
                findAfterFlightTransfers(flight, destination, dayOfWeek)
                        .forEach(afterTransfer ->
                                validRoutes.add(new RouteDTO(
                                        null,
                                        mapToDTO(flight),
                                        mapToDTO(afterTransfer),
                                        origin.getName(),
                                        destination.getName()
                                ))
                        );
            } else if (flight.getDestinationLocation().equals(destination)) {
                // Try to find before flight transfers
                findBeforeFlightTransfers(origin, flight, dayOfWeek)
                        .forEach(beforeTransfer ->
                                validRoutes.add(new RouteDTO(
                                        mapToDTO(beforeTransfer),
                                        mapToDTO(flight),
                                        null,
                                        origin.getName(),
                                        destination.getName()
                                ))
                        );
            } else {
                // Try to find both before and after transfers
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

    private List<Transportation> findBeforeFlightTransfers(
            Location origin,
            Transportation flight,
            int dayOfWeek) {
        return transportationRepository.findByDestinationLocationAndTransportationType(
                        flight.getOriginLocation(),
                        TransportationType.FLIGHT
                )
                .stream()
                .filter(t -> t.getOriginLocation().equals(origin))
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                .filter(t -> t.getTransportationType() != TransportationType.FLIGHT)
                .collect(Collectors.toList());
    }

    private List<Transportation> findAfterFlightTransfers(
            Transportation flight,
            Location destination,
            int dayOfWeek) {
        return transportationRepository.findByOriginLocationAndTransportationType(
                        flight.getDestinationLocation(),
                        TransportationType.FLIGHT
                )
                .stream()
                .filter(t -> t.getDestinationLocation().equals(destination))
                .filter(t -> t.getOperatingDays().contains(dayOfWeek))
                .filter(t -> t.getTransportationType() != TransportationType.FLIGHT)
                .collect(Collectors.toList());
    }

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
