package com.thy.flightroutes.temp;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Execute after LocationDatabaseInitializer
@Profile({"dev", "test"})
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
                            if(origin.getCity().equals(destination.getCity())){
                                                                                                                                                                                                if(origin.getLocationCode().length() != 3 || destination.getLocationCode().length() != 3){
                                        Transportation bus = createTransportation(
                                                origin,
                                                destination,
                                                TransportationType.BUS,
                                                generateDailyOperatingDays() // Buses run daily
                                        );
                                        Transportation uber = createTransportation(
                                                origin,
                                                destination,
                                                TransportationType.UBER,
                                                generateDailyOperatingDays() // Buses run daily
                                        );
                                        Transportation subway = createTransportation(
                                                origin,
                                                destination,
                                                TransportationType.SUBWAY,
                                                generateDailyOperatingDays() // Buses run daily
                                        );
                                        transportations.addAll(Arrays.asList(bus, uber, subway));

                                }
                            }
                            //Havayolu
                            if(origin.getLocationCode().length() == 3 && destination.getLocationCode().length() == 3){

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