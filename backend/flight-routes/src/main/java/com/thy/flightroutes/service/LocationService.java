package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.dto.PageResponseDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LocationService {

  private final LocationRepository locationRepository;

  /* ---------- READ OPERATIONS ---------- */

  @Cacheable(value = "locations", key = "'all_' + #page + '_' + #size")
  public PageResponseDTO<LocationDTO> getAllLocations(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
    Page<Location> locationPage = locationRepository.findAll(pageable);
    
    List<LocationDTO> content = locationPage.getContent().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());

    return new PageResponseDTO<>(
            content,
            page,
            size,
            locationPage.getTotalElements(),
            locationPage.getTotalPages(),
            locationPage.hasNext(),
            locationPage.hasPrevious(),
            locationPage.isFirst(),
            locationPage.isLast()
    );
  }

  @Cacheable(value = "locations", key = "#code")
  public LocationDTO getLocationByCode(String code) {
    Location location =
        locationRepository
            .findByLocationCode(code)
            .orElseThrow(
                () -> new ResourceNotFoundException("Location not found with code: " + code));
    return toDTO(location);
  }

  /* ---------- WRITE OPERATIONS ---------- */

  @CacheEvict(
      value = {"locations", "routes"},
      allEntries = true)
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

  // <---------- Güncellediğimiz satır
  @CacheEvict(
      value = {"locations", "routes"},
      allEntries = true)
  public LocationDTO updateLocation(Long id, LocationDTO locationDTO) {
    Location location =
        locationRepository
            .findById(id)
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

  @CacheEvict(
      value = {"locations", "routes"},
      allEntries = true)
  public void deleteLocation(Long id) {
    if (!locationRepository.existsById(id)) {
      throw new ResourceNotFoundException("Location not found");
    }
    locationRepository.deleteById(id);
  }

  /* ---------- HELPER METHODS ---------- */

  private void validateLocationCode(String code) {
    if (locationRepository.findByLocationCode(code).isPresent()) {
      throw new IllegalArgumentException("Location code already exists: " + code);
    }
    if (!code.matches("^([A-Z]{3}|CC[A-Z]{2,4})$")) {
      throw new IllegalArgumentException("Invalid location code format: " + code);
    }
  }

  private LocationDTO toDTO(Location location) {
    return new LocationDTO(
        location.getId(),
        location.getName(),
        location.getCountry(),
        location.getCity(),
        location.getLocationCode());
  }
}
