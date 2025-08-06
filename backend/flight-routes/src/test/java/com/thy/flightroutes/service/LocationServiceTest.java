package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private LocationService locationService;

    private LocationDTO validDto;
    private Location existingLocation;

    @BeforeEach
    void setUp() {
        validDto = new LocationDTO(null, "Istanbul Airport", "Türkiye", "İstanbul", "IST", true);
        existingLocation = new Location();
        existingLocation.setId(1L);
        existingLocation.setName("Istanbul Airport");
        existingLocation.setCountry("Türkiye");
        existingLocation.setCity("İstanbul");
        existingLocation.setLocationCode("IST");
        existingLocation.setIsAirport(true);
    }

    @Test
    void createLocation_withValidData_shouldCreateLocation() {
        when(locationRepository.findByLocationCode("IST")).thenReturn(Optional.empty());
        when(locationRepository.save(any(Location.class))).thenReturn(existingLocation);

        LocationDTO result = locationService.createLocation(validDto);

        assertThat(result.getLocationCode()).isEqualTo("IST");
        verify(locationRepository).findByLocationCode("IST");
        verify(locationRepository).save(any(Location.class));
    }

    @Test
    void createLocation_withDuplicateCode_shouldThrowException() {
        when(locationRepository.findByLocationCode("IST")).thenReturn(Optional.of(existingLocation));

        assertThrows(IllegalArgumentException.class, () -> locationService.createLocation(validDto));
        verify(locationRepository).findByLocationCode("IST");
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void createLocation_withInvalidCode_shouldThrowException() {
        LocationDTO invalid = new LocationDTO(null, "Test", "Test", "Test", "INVALID", false);
        when(locationRepository.findByLocationCode("INVALID")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> locationService.createLocation(invalid));
        verify(locationRepository).findByLocationCode("INVALID");
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void updateLocation_whenLocationNotFound_shouldThrowException() {
        when(locationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> locationService.updateLocation(1L, validDto));
        verify(locationRepository).findById(1L);
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void updateLocation_withDuplicateNewCode_shouldThrowException() {
        Location locationToUpdate = new Location();
        locationToUpdate.setId(1L);
        locationToUpdate.setLocationCode("ABC");

        when(locationRepository.findById(1L)).thenReturn(Optional.of(locationToUpdate));
        when(locationRepository.findByLocationCode("IST")).thenReturn(Optional.of(existingLocation));

        assertThrows(IllegalArgumentException.class, () -> locationService.updateLocation(1L, validDto));
        verify(locationRepository).findById(1L);
        verify(locationRepository).findByLocationCode("IST");
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void updateLocation_withInvalidNewCode_shouldThrowException() {
        Location locationToUpdate = new Location();
        locationToUpdate.setId(1L);
        locationToUpdate.setLocationCode("ABC");

        LocationDTO invalid = new LocationDTO(null, "Test", "Test", "Test", "BADCODE", false);
        when(locationRepository.findById(1L)).thenReturn(Optional.of(locationToUpdate));
        when(locationRepository.findByLocationCode("BADCODE")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> locationService.updateLocation(1L, invalid));
        verify(locationRepository).findById(1L);
        verify(locationRepository).findByLocationCode("BADCODE");
        verify(locationRepository, never()).save(any(Location.class));
    }

    @Test
    void deleteLocation_whenExists_shouldDelete() {
        when(locationRepository.existsById(1L)).thenReturn(true);

        locationService.deleteLocation(1L);

        verify(locationRepository).existsById(1L);
        verify(locationRepository).deleteById(1L);
    }

    @Test
    void deleteLocation_whenNotExists_shouldThrowException() {
        when(locationRepository.existsById(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> locationService.deleteLocation(1L));
        verify(locationRepository).existsById(1L);
        verify(locationRepository, never()).deleteById(any());
    }
}