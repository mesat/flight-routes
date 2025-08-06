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

  @Cacheable(value = "locations", key = "'page_' + #page + '_size_' + #size")
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

  @Cacheable(value = "locations", key = "'code_' + #code")
  public LocationDTO getLocationByCode(String code) {
    Location location =
        locationRepository
            .findByLocationCode(code)
            .orElseThrow(
                () -> new ResourceNotFoundException("Location not found with code: " + code));
    return toDTO(location);
  }

  @Cacheable(value = "locations", key = "'search_' + (#searchTerm != null ? #searchTerm : 'null') + '_page_' + #page + '_size_' + #size")
  public PageResponseDTO<LocationDTO> searchLocations(String searchTerm, int page, int size) {
    System.out.println("🔍 LOCATION SEARCH - Original term: '" + searchTerm + "'");
    
    Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
    Page<Location> locationPage;
    
    if (searchTerm != null && !searchTerm.trim().isEmpty()) {
      // Türkçe karakter normalizasyonu
      String normalizedSearchTerm = normalizeTurkishText(searchTerm.trim());
      System.out.println("🔍 LOCATION SEARCH - Normalized term: '" + normalizedSearchTerm + "'");
      
      locationPage = locationRepository.findBySearchTermNormalized(normalizedSearchTerm, pageable);
      System.out.println("🔍 LOCATION SEARCH - Found " + locationPage.getTotalElements() + " results");
      
      // İlk birkaç sonucu debug için yazdır
      locationPage.getContent().forEach(loc -> {
        System.out.println("  📍 " + loc.getName() + " (" + loc.getCity() + ", " + loc.getCountry() + ") [" + loc.getLocationCode() + "]");
      });
    } else {
      System.out.println("🔍 LOCATION SEARCH - Empty search term, returning all");
      locationPage = locationRepository.findAll(pageable);
    }
    
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

  // Türkçe karakterleri normalize eden fonksiyon
  private String normalizeTurkishText(String text) {
    return text.toLowerCase()
            .replace("ğ", "g")
            .replace("ü", "u")
            .replace("ş", "s")
            .replace("ı", "i")
            .replace("ö", "o")
            .replace("ç", "c")
            .replace("Ğ", "g")
            .replace("Ü", "u")
            .replace("Ş", "s")
            .replace("İ", "i")
            .replace("Ö", "o")
            .replace("Ç", "c");
  }

  /* ---------- WRITE OPERATIONS ---------- */

  // Granular cache eviction - clear locations and routes cache as new locations affect route calculations
  @CacheEvict(value = {"locations", "routes"}, allEntries = true)
  public LocationDTO createLocation(LocationDTO locationDTO) {
    System.out.println("Creating location: " + locationDTO.getName() + " - Cache will be evicted");
    validateLocationCode(locationDTO.getLocationCode(), locationDTO.getIsAirport());

    Location location = new Location();
    location.setName(locationDTO.getName());
    location.setCountry(locationDTO.getCountry());
    location.setCity(locationDTO.getCity());
    location.setLocationCode(locationDTO.getLocationCode());
    location.setIsAirport(locationDTO.getIsAirport());

    location = locationRepository.save(location);
    return toDTO(location);
  }

  // Granular cache eviction - clear locations and routes cache as location changes affect route calculations
  @CacheEvict(value = {"locations", "routes"}, allEntries = true)
  public LocationDTO updateLocation(Long id, LocationDTO locationDTO) {
    Location location =
        locationRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

    // Havalimanı durumu değiştirilemez
    if (!location.getIsAirport().equals(locationDTO.getIsAirport())) {
      throw new IllegalArgumentException("Airport status cannot be changed after creation");
    }

    if (!location.getLocationCode().equals(locationDTO.getLocationCode())) {
      validateLocationCode(locationDTO.getLocationCode(), locationDTO.getIsAirport());
    }

    location.setName(locationDTO.getName());
    location.setCountry(locationDTO.getCountry());
    location.setCity(locationDTO.getCity());
    location.setLocationCode(locationDTO.getLocationCode());
    // isAirport alanını güncelleme - değiştirilemez olduğu için set etmiyoruz

    location = locationRepository.save(location);
    return toDTO(location);
  }

  // Granular cache eviction - clear locations and routes cache as location deletion affects route calculations
  @CacheEvict(value = {"locations", "routes"}, allEntries = true)
  public void deleteLocation(Long id) {
    if (!locationRepository.existsById(id)) {
      throw new ResourceNotFoundException("Location not found");
    }
    locationRepository.deleteById(id);
  }

  /* ---------- HELPER METHODS ---------- */

  private void validateLocationCode(String code, Boolean isAirport) {
    if (locationRepository.findByLocationCode(code).isPresent()) {
      throw new IllegalArgumentException("Location code already exists: " + code);
    }
    
    if (isAirport != null && isAirport) {
      // Havalimanı ise 3 harf zorunlu
      if (!code.matches("^[A-Z]{3}$")) {
        throw new IllegalArgumentException("Airport location code must be exactly 3 uppercase letters (IATA code)");
      }
    } else {
      // Havalimanı değilse 4-7 harf zorunlu
      if (!code.matches("^[A-Z]{4,7}$")) {
        throw new IllegalArgumentException("Non-airport location code must be 4-7 uppercase letters");
      }
    }
  }

  private LocationDTO toDTO(Location location) {
    System.out.println("🏛️ toDTO - Location: " + location.getName() + " [" + location.getLocationCode() + "] isAirport: " + location.getIsAirport());
    return new LocationDTO(
        location.getId(),
        location.getName(),
        location.getCountry(),
        location.getCity(),
        location.getLocationCode(),
        location.getIsAirport());
  }
}
