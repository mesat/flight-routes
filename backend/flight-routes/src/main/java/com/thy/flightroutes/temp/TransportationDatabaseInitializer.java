package com.thy.flightroutes.temp;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Execute after LocationDatabaseInitializer
public class TransportationDatabaseInitializer implements CommandLineRunner {

    private final TransportationRepository transportationRepository;
    private final LocationRepository locationRepository;
    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (transportationRepository.count() == 0) {
            try {
                // Get all locations
                List<Location> locations = locationRepository.findAll();

                if (locations.isEmpty()) {
                    log.warn("No locations found. Cannot initialize transportation data.");
                    return;
                }

                List<Transportation> transportations = new ArrayList<>();

                // Create direct flights between locations
                for (int i = 0; i < locations.size(); i++) {
                    for (int j = 0; j < locations.size(); j++) {
                        if (i != j) { // Avoid self-routes
                            Location origin = locations.get(i);
                            Location destination = locations.get(j);

                            // Create a flight with random operating days
                            Transportation flight = createTransportation(
                                    origin,
                                    destination,
                                    TransportationType.FLIGHT,
                                    generateRandomOperatingDays()
                            );

                            transportations.add(flight);
                        }
                    }
                }

                // Add some other transportation types between nearby locations
                // For simplicity, we'll define some "nearby" locations based on indices
                Map<Integer, List<Integer>> nearbyLocations = new HashMap<>();
                nearbyLocations.put(0, Arrays.asList(1, 2)); // First location is near second and third
                nearbyLocations.put(3, Arrays.asList(4, 5)); // Fourth location is near fifth and sixth
                nearbyLocations.put(6, Arrays.asList(7, 8)); // Seventh location is near eighth and ninth

                // Create bus and subway routes between nearby locations
                for (Map.Entry<Integer, List<Integer>> entry : nearbyLocations.entrySet()) {
                    int originIndex = entry.getKey();
                    List<Integer> destinationIndices = entry.getValue();

                    if (originIndex < locations.size()) {
                        Location origin = locations.get(originIndex);

                        for (int destIndex : destinationIndices) {
                            if (destIndex < locations.size()) {
                                Location destination = locations.get(destIndex);

                                // Create a BUS transportation
                                Transportation bus = createTransportation(
                                        origin,
                                        destination,
                                        TransportationType.BUS,
                                        generateDailyOperatingDays() // Buses run daily
                                );

                                // Create a SUBWAY transportation if applicable
                                if (random.nextBoolean()) {
                                    Transportation subway = createTransportation(
                                            origin,
                                            destination,
                                            TransportationType.SUBWAY,
                                            generateDailyOperatingDays() // Subways run daily
                                    );
                                    transportations.add(subway);
                                }

                                transportations.add(bus);

                                // Create reverse route as well
                                Transportation busReverse = createTransportation(
                                        destination,
                                        origin,
                                        TransportationType.BUS,
                                        generateDailyOperatingDays()
                                );
                                transportations.add(busReverse);
                            }
                        }
                    }
                }

                // Save all transportations
                transportationRepository.saveAll(transportations);
                log.info("Successfully initialized {} transportation routes", transportations.size());

            } catch (Exception e) {
                log.error("Failed to initialize transportation data", e);
            }
        } else {
            log.info("Transportation data already exists, skipping initialization");
        }
    }

    private Transportation createTransportation(Location origin, Location destination,
                                                TransportationType type, Set<Integer> operatingDays) {
        Transportation transportation = new Transportation();
        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setTransportationType(type);
        transportation.setOperatingDays(operatingDays);
        return transportation;
    }

    private Set<Integer> generateRandomOperatingDays() {
        Set<Integer> operatingDays = new HashSet<>();
        int numDays = random.nextInt(4) + 1; // Between 1 and 4 days

        while (operatingDays.size() < numDays) {
            int day = random.nextInt(7) + 1; // Days 1-7 (Monday to Sunday)
            operatingDays.add(day);
        }

        return operatingDays;
    }

    private Set<Integer> generateDailyOperatingDays() {
        Set<Integer> operatingDays = new HashSet<>();
        for (int i = 1; i <= 7; i++) {
            operatingDays.add(i);
        }
        return operatingDays;
    }
}