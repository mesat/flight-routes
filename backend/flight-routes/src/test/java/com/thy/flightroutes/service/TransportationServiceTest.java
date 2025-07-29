package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransportationServiceTest {

    @Mock
    private TransportationRepository transportationRepository;

    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private TransportationService transportationService;

    private Location originLocation;
    private Location destinationLocation;
    private Transportation testTransportation;
    private TransportationDTO testTransportationDTO;

    @BeforeEach
    void setUp() {
        // Set up locations
        originLocation = new Location();
        originLocation.setId(1L);
        originLocation.setName("Istanbul Airport");
        originLocation.setLocationCode("IST");

        destinationLocation = new Location();
        destinationLocation.setId(2L);
        destinationLocation.setName("London Heathrow");
        destinationLocation.setLocationCode("LHR");

        // Set up transportation
        testTransportation = new Transportation();
        testTransportation.setId(1L);
        testTransportation.setOriginLocation(originLocation);
        testTransportation.setDestinationLocation(destinationLocation);
        testTransportation.setTransportationType(TransportationType.FLIGHT);
        testTransportation.setOperatingDays(new HashSet<>(Arrays.asList(1, 3, 5)));

        // Set up DTO
        testTransportationDTO = new TransportationDTO();
        testTransportationDTO.setOriginLocationId(1L);
        testTransportationDTO.setDestinationLocationId(2L);
        testTransportationDTO.setTransportationType(TransportationType.FLIGHT);
        testTransportationDTO.setOperatingDays(Set.of(1, 3, 5));
    }

    @Test
    void getAllTransportations_ShouldReturnAllTransportations() {
        // Given
        List<Transportation> transportations = Arrays.asList(testTransportation);
        when(transportationRepository.findAll()).thenReturn(transportations);

        // When
        List<TransportationDTO> result = transportationService.getAllTransportations();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTransportationType()).isEqualTo(TransportationType.FLIGHT);
        verify(transportationRepository).findAll();
    }

    @Test
    void getTransportationsByLocations_ShouldReturnTransportations() {
        // Given
        when(locationRepository.findById(1L)).thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(2L)).thenReturn(Optional.of(destinationLocation));
        when(transportationRepository.findByOriginLocationAndDestinationLocation(originLocation, destinationLocation))
                .thenReturn(Arrays.asList(testTransportation));

        // When
        List<TransportationDTO> result = transportationService.getTransportationsByLocations(1L, 2L);

        // Then
        assertThat(result).hasSize(1);
        verify(locationRepository).findById(1L);
        verify(locationRepository).findById(2L);
        verify(transportationRepository).findByOriginLocationAndDestinationLocation(originLocation, destinationLocation);
    }

    @Test
    void createTransportation_WithValidData_ShouldCreateTransportation() {
        // Given
        when(locationRepository.findById(1L)).thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(2L)).thenReturn(Optional.of(destinationLocation));
        when(transportationRepository.save(any(Transportation.class))).thenReturn(testTransportation);

        // When
        TransportationDTO result = transportationService.createTransportation(testTransportationDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTransportationType()).isEqualTo(TransportationType.FLIGHT);
        assertThat(result.getOriginLocationId()).isEqualTo(1L);
        assertThat(result.getDestinationLocationId()).isEqualTo(2L);
        verify(locationRepository).findById(1L);
        verify(locationRepository).findById(2L);
        verify(transportationRepository).save(any(Transportation.class));
    }

    @Test
    void createTransportation_WithSameLocations_ShouldThrowException() {
        // Given
        testTransportationDTO.setDestinationLocationId(1L);

        // When/Then
        assertThrows(IllegalArgumentException.class, () ->
                transportationService.createTransportation(testTransportationDTO)
        );
        verify(transportationRepository, never()).save(any(Transportation.class));
    }

    @Test
    void createTransportation_WithEmptyOperatingDays_ShouldThrowException() {
        // Given
        testTransportationDTO.setOperatingDays(new HashSet<>());

        // When/Then
        assertThrows(IllegalArgumentException.class, () ->
                transportationService.createTransportation(testTransportationDTO)
        );
        verify(transportationRepository, never()).save(any(Transportation.class));
    }

    @Test
    void updateTransportation_WithValidData_ShouldUpdateTransportation() {
        // Given
        Long id = 1L;
        when(transportationRepository.findById(id)).thenReturn(Optional.of(testTransportation));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(2L)).thenReturn(Optional.of(destinationLocation));
        when(transportationRepository.save(any(Transportation.class))).thenReturn(testTransportation);

        // When
        TransportationDTO result = transportationService.updateTransportation(id, testTransportationDTO);

        // Then
        assertThat(result).isNotNull();
        verify(transportationRepository).findById(id);
        verify(transportationRepository).save(any(Transportation.class));
    }

    @Test
    void updateTransportation_WhenTransportationDoesNotExist_ShouldThrowException() {
        // Given
        Long id = 1L;
        when(transportationRepository.findById(id)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(ResourceNotFoundException.class, () ->
                transportationService.updateTransportation(id, testTransportationDTO)
        );
        verify(transportationRepository).findById(id);
        verify(transportationRepository, never()).save(any(Transportation.class));
    }

    @Test
    void deleteTransportation_WhenTransportationExists_ShouldDeleteTransportation() {
        // Given
        Long id = 1L;
        when(transportationRepository.existsById(id)).thenReturn(true);

        // When
        transportationService.deleteTransportation(id);

        // Then
        verify(transportationRepository).existsById(id);
        verify(transportationRepository).deleteById(id);
    }

    @Test
    void deleteTransportation_WhenTransportationDoesNotExist_ShouldThrowException() {
        // Given
        Long id = 1L;
        when(transportationRepository.existsById(id)).thenReturn(false);

        // When/Then
        assertThrows(ResourceNotFoundException.class, () ->
                transportationService.deleteTransportation(id)
        );
        verify(transportationRepository).existsById(id);
        verify(transportationRepository, never()).deleteById(any());
    }
}



