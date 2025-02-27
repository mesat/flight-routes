package com.thy.flightroutes.temp;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import com.thy.flightroutes.service.RouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * This class tests route generation by querying routes between predefined locations
 * It helps verify that the route generation algorithm works correctly
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(3) // Execute after TransportationDatabaseInitializer
public class RouteTestDataGenerator implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final TransportationRepository transportationRepository;
    private final RouteService routeService;

    @Override
    @Transactional
    public void run(String... args) {
        // Only run this if transportation data exists
        if (transportationRepository.count() > 0) {
            try {
                // Get some test locations
                List<Location> locations = locationRepository.findAll();

                if (locations.size() < 2) {
                    log.warn("Not enough locations to test route generation");
                    return;
                }

                // Get a city center location (if available)
                Location originLocation = null;
                for (Location location : locations) {
                    if (location.getLocationCode().startsWith("CC")) {
                        originLocation = location;
                        break;
                    }
                }

                if (originLocation == null) {
                    originLocation = locations.getFirst();
                }

                // Find a destination that's in a different city
                Location destinationLocation = null;
                for (Location location : locations) {
                    if (!location.getCity().equals(originLocation.getCity())) {
                        destinationLocation = location;
                        break;
                    }
                }

                if (destinationLocation == null) {
                    destinationLocation = locations.getLast();
                }

                log.info("Testing route generation from {} to {}",
                        originLocation.getLocationCode(), destinationLocation.getLocationCode());

                // Find a date when both locations have flights available
                LocalDate testDate = findDateWithAvailableFlights(originLocation, destinationLocation);

                if (testDate != null) {
                    log.info("Testing with date: {}", testDate);

                    // Generate routes
                    List<RouteDTO> routes = routeService.findRoutes(
                            RouteRequestDTO.builder()
                                    .originLocationCode(originLocation.getLocationCode())
                                    .destinationLocationCode(destinationLocation.getLocationCode())
                                    .date(testDate)
                                    .build()
                    );

                    // Log results
                    log.info("Found {} potential routes", routes.size());

                    if (!routes.isEmpty()) {
                        RouteDTO exampleRoute = routes.getFirst();
                        log.info("Example route:");

                        if (exampleRoute.getBeforeFlight() != null) {
                            log.info("- Before flight: {} from {} to {} ({})",
                                    exampleRoute.getBeforeFlight().getTransportationType(),
                                    exampleRoute.getBeforeFlight().getOriginLocationId(),
                                    exampleRoute.getBeforeFlight().getDestinationLocationId(),
                                    exampleRoute.getBeforeFlight().getOperatingDays());
                        }

                        log.info("- Flight: {} from {} to {} ({})",
                                exampleRoute.getFlight().getTransportationType(),
                                exampleRoute.getFlight().getOriginLocationId(),
                                exampleRoute.getFlight().getDestinationLocationId(),
                                exampleRoute.getFlight().getOperatingDays());

                        if (exampleRoute.getAfterFlight() != null) {
                            log.info("- After flight: {} from {} to {} ({})",
                                    exampleRoute.getAfterFlight().getTransportationType(),
                                    exampleRoute.getAfterFlight().getOriginLocationId(),
                                    exampleRoute.getAfterFlight().getDestinationLocationId(),
                                    exampleRoute.getAfterFlight().getOperatingDays());
                        }
                    }
                }

            } catch (Exception e) {
                log.error("Error during route test data generation", e);
            }
        }
    }

    /**
     * Find a date within the next 10 days when flights between the cities are available
     */
    @Transactional
    public LocalDate findDateWithAvailableFlights(Location origin, Location destination) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(10);

        // Eagerly get all data needed
        List<Transportation> allTransportations = transportationRepository.findAll();

        // Create filtered list manually
        List<Transportation> flights = new ArrayList<>();
        for (Transportation t : allTransportations) {
            if (t.getTransportationType() == Transportation.TransportationType.FLIGHT) {
                boolean originMatches = t.getOriginLocation().getCity().equals(origin.getCity()) ||
                        isNearbyAirport(t.getOriginLocation(), origin);
                boolean destMatches = t.getDestinationLocation().getCity().equals(destination.getCity()) ||
                        isNearbyAirport(t.getDestinationLocation(), destination);

                if (originMatches && destMatches) {
                    flights.add(t);
                }
            }
        }

        if (flights.isEmpty()) {
            log.warn("No flights found between {} and {}", origin.getCity(), destination.getCity());
            return startDate; // Just return today's date as fallback
        }

        // Try each date in the next 10 days
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1-7 for Monday-Sunday

            // Check if any flight operates on this day
            for (Transportation flight : flights) {
                if (flight.getOperatingDays().contains(dayOfWeek)) {
                    return date; // Return the first date a flight is available
                }
            }
        }

        // If no specific day found, get the next occurrence of a day when a flight is available
        Transportation firstFlight = flights.getFirst();
        int firstOperatingDay = firstFlight.getOperatingDays().iterator().next();
        DayOfWeek dayOfWeek = DayOfWeek.of(firstOperatingDay);

        return startDate.with(TemporalAdjusters.nextOrSame(dayOfWeek));
    }

    /**
     * Check if an airport is nearby to the origin location
     */
    private boolean isNearbyAirport(Location airport, Location origin) {
        // In a real app, this would check based on geographic coordinates
        // For this test, we'll just consider same city
        return airport.getCity().equals(origin.getCity());
    }
}