package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {
    private final LocationService locationService;
    private final LocationRepository locationRepository;
    private final TransportationRepository transportationRepository;
    private final RouteFinderService routeFinderService;

    @Cacheable(value = "routes",
            key = "#request.originLocationCode + '_' + #request.destinationLocationCode + '_' + #request.date",
            unless = "#result.isEmpty()")
    public List<RouteDTO> findRoutes(RouteRequestDTO request) {
        // Parse date to get day of week
        LocalDate date = request.getDate();
        int dayOfWeek = date.getDayOfWeek().getValue();

        // Get locations
        Location origin = locationRepository.findByLocationCode(request.getOriginLocationCode())
                .orElseThrow(() -> new ResourceNotFoundException("Origin location not found: " + request.getOriginLocationCode()));

        Location destination = locationRepository.findByLocationCode(request.getDestinationLocationCode())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + request.getDestinationLocationCode()));

        // Validate different locations
        if (Objects.equals(origin.getId(), destination.getId())) {
            throw new IllegalArgumentException("Origin and destination cannot be the same");
        }

        // Get all possible routes
        List<RouteDTO> routes = routeFinderService.findAllRoutes(origin, destination, dayOfWeek);

        // Sort routes by total segments (less transfers first)
        routes.sort((r1, r2) -> {
            int segments1 = countSegments(r1);
            int segments2 = countSegments(r2);
            return Integer.compare(segments1, segments2);
        });

        return routes;
    }

    private int countSegments(RouteDTO route) {
        int count = 0;
        if (route.getBeforeFlight() != null) count++;
        if (route.getFlight() != null) count++;
        if (route.getAfterFlight() != null) count++;
        return count;
    }

    @CacheEvict(value = "routes", allEntries = true)
    @Scheduled(cron = "0 0 0 * * *") // Midnight every day
    public void clearRouteCache() {
        // Cache will be cleared automatically by Spring
    }
}