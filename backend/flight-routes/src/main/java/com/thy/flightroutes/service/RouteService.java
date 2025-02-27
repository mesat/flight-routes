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
        // Get locations
        Location originLocation = locationRepository.findByLocationCode(request.getOriginLocationCode())
                .orElseThrow(() -> new IllegalArgumentException("Origin location not found: " + request.getOriginLocationCode()));

        Location destinationLocation = locationRepository.findByLocationCode(request.getDestinationLocationCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination location not found: " + request.getDestinationLocationCode()));

        // Get all flights and create DTOs
        List<Transportation> allTransportations = transportationRepository.findAll();

        // Find available routes
        List<RouteDTO> routes = new ArrayList<>();

        // First, find all direct flights between origin and destination
        addDirectFlights(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // Find routes with a transfer before the flight
        addRoutesWithBeforeFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // Find routes with a transfer after the flight
        addRoutesWithAfterFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // Find routes with transfers both before and after flight
        addRoutesWithBeforeAndAfterFlight(routes, allTransportations, originLocation, destinationLocation, request.getDate());

        // Create deep copies of all routes to detach from Hibernate session

        return routes.stream()
                .map(RouteDTO::deepCopy)
                .collect(Collectors.toList());
    }

    private void addDirectFlights(List<RouteDTO> routes, List<Transportation> allTransportations,
                                  Location originLocation, Location destinationLocation, LocalDate date) {
        // Implementation details...

        for (Transportation t : allTransportations) {
            if (isFlightBetweenLocations(t, originLocation, destinationLocation) &&
                    isAvailableOnDate(t, date)) {

                RouteDTO route = RouteDTO.builder()
                        .flight(TransportationDTO.fromEntity(t))
                        .originLocationName(originLocation.getName())
                        .destinationLocationName(destinationLocation.getName())
                        .build();

                routes.add(route);
            }
        }
    }

    private void addRoutesWithBeforeFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                           Location originLocation, Location destinationLocation, LocalDate date) {
        // Implementation details...
    }

    private void addRoutesWithAfterFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                          Location originLocation, Location destinationLocation, LocalDate date) {
        // Implementation details...
    }

    private void addRoutesWithBeforeAndAfterFlight(List<RouteDTO> routes, List<Transportation> allTransportations,
                                                   Location originLocation, Location destinationLocation, LocalDate date) {
        // Implementation details...
    }

    private boolean isFlightBetweenLocations(Transportation transportation, Location origin, Location destination) {
        return transportation.getTransportationType() == Transportation.TransportationType.FLIGHT &&
                transportation.getOriginLocation().getId().equals(origin.getId()) &&
                transportation.getDestinationLocation().getId().equals(destination.getId());
    }

    private boolean isAvailableOnDate(Transportation transportation, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1-7 (Monday-Sunday)
        return transportation.getOperatingDays().contains(dayOfWeek);
    }
}