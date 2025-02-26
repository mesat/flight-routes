package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LocationService {
    private final LocationRepository locationRepository;

    @Cacheable(value = "locations", key = "'all'", unless = "#result == null || #result.isEmpty()")
    public List<LocationDTO> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

    }
    @Cacheable(value = "locations", key = "#code")
    public LocationDTO getLocationByCode(String code) {
        Location location = locationRepository.findByLocationCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with code: " + code));

        return toDTO(location);
    }

    @CacheEvict(value = "locations", allEntries = true)
    public LocationDTO createLocation(LocationDTO locationDTO) {
        validateLocationCode(locationDTO.getLocationCode());

        Location location = new Location();
        location.setName(locationDTO.getName());
        location.setCountry(locationDTO.getCountry());
        location.setCity(locationDTO.getCity());
        location.setLocationCode(locationDTO.getLocationCode());

        location = locationRepository.save(location);
        return toDTO(location);
    }

    @CacheEvict(value = "locations", allEntries = true)
    public LocationDTO updateLocation(Long id, LocationDTO locationDTO) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getLocationCode().equals(locationDTO.getLocationCode())) {
            validateLocationCode(locationDTO.getLocationCode());
        }

        location.setName(locationDTO.getName());
        location.setCountry(locationDTO.getCountry());
        location.setCity(locationDTO.getCity());
        location.setLocationCode(locationDTO.getLocationCode());

        location = locationRepository.save(location);
        return toDTO(location);
    }

    @CacheEvict(value = {"locations", "routes"}, allEntries = true)
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location not found");
        }
        locationRepository.deleteById(id);
    }

    private void validateLocationCode(String code) {
        if (locationRepository.findByLocationCode(code).isPresent()) {
            throw new IllegalArgumentException("Location code already exists: " + code);
        }

        if (!code.matches("^([A-Z]{3}|CC[A-Z]{2,4})$")) {
            throw new IllegalArgumentException("Invalid location code format");
        }
    }

    private LocationDTO toDTO(Location location) {
        LocationDTO dto = new LocationDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setCountry(location.getCountry());
        dto.setCity(location.getCity());
        dto.setLocationCode(location.getLocationCode());
        return dto;
    }
}