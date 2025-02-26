package com.thy.flightroutes.temp;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LocationDatabaseInitializer implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) {
        if (locationRepository.count() == 0) {
            try {
                // Read locations from JSON file in classpath
                ClassPathResource resource = new ClassPathResource("data/locations.json");
                InputStream inputStream = resource.getInputStream();

                List<Location> locations = objectMapper.readValue(
                        inputStream,
                        new TypeReference<>() {}
                );

                locationRepository.saveAll(locations);
                log.info("Successfully initialized {} locations from JSON file", locations.size());
            } catch (Exception e) {
                log.error("Failed to initialize locations from JSON file", e);
            }
        } else {
            log.info("Locations already exist, skipping initialization");
        }
    }

}
