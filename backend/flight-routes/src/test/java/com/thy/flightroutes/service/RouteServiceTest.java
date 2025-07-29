package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private RouteFinderService routeFinderService;

    @InjectMocks
    private RouteService routeService;

    private Location origin;
    private Location destination;
    private Location transfer;
    private Transportation directFlight;
    private Transportation transferFlight;
    private RouteRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        // Set up locations
        origin = new Location();
        origin.setId(1L);
        origin.setName("Istanbul");
        origin.setLocationCode("IST");

        destination = new Location();
        destination.setId(2L);
        destination.setName("London");
        destination.setLocationCode("LHR");

        transfer = new Location();
        transfer.setId(3L);
        transfer.setName("Paris");
        transfer.setLocationCode("CDG");

        // Set up transportations
        directFlight = new Transportation();
        directFlight.setId(1L);
        directFlight.setOriginLocation(origin);
        directFlight.setDestinationLocation(destination);
        directFlight.setTransportationType(TransportationType.FLIGHT);
        directFlight.setOperatingDays(Set.of(1, 3, 5));

        transferFlight = new Transportation();
        transferFlight.setId(2L);
        transferFlight.setOriginLocation(origin);
        transferFlight.setDestinationLocation(transfer);
        transferFlight.setTransportationType(TransportationType.FLIGHT);
        transferFlight.setOperatingDays(Set.of(1, 2, 3, 4, 5));

        // Set up request DTO
        requestDTO = new RouteRequestDTO();
        requestDTO.setOriginLocationCode("IST");
        requestDTO.setDestinationLocationCode("LHR");
        requestDTO.setDate(LocalDate.now());
    }

    @Test
    void findRoutes_WithSameLocations_ShouldThrowException() {
        // Given
        requestDTO.setDestinationLocationCode("IST");
        when(locationRepository.findByLocationCode(eq("IST"))).thenReturn(Optional.of(origin));

        // When/Then
        assertThrows(IllegalArgumentException.class, () ->
                routeService.findRoutes(requestDTO)
        );
    }

    @Test
    void findRoutes_WhenOriginNotFound_ShouldThrowException() {
        // Given
        when(locationRepository.findByLocationCode(eq("IST"))).thenReturn(Optional.empty());

        // When/Then
        assertThrows(ResourceNotFoundException.class, () ->
                routeService.findRoutes(requestDTO)
        );
    }

    @Test
    void findRoutes_WhenDestinationNotFound_ShouldThrowException() {
        // Given
        when(locationRepository.findByLocationCode(eq("IST"))).thenReturn(Optional.of(origin));
        when(locationRepository.findByLocationCode(eq("LHR"))).thenReturn(Optional.empty());

        // When/Then
        assertThrows(ResourceNotFoundException.class, () ->
                routeService.findRoutes(requestDTO)
        );
    }

    private RouteDTO createRouteDTO(TransportationDTO before, Transportation flight, TransportationDTO after) {
        RouteDTO dto = new RouteDTO();
        dto.setBeforeFlight(before);
        dto.setFlight(mapTransportationToDTO(flight));
        dto.setAfterFlight(after);
        dto.setOriginLocationName(origin.getName());
        dto.setDestinationLocationName(destination.getName());
        return dto;
    }

    private TransportationDTO createTransportationDTO(TransportationType type) {
        TransportationDTO dto = new TransportationDTO();
        dto.setTransportationType(type);
        dto.setOperatingDays(Set.of(1, 2, 3, 4, 5));
        return dto;
    }

    private TransportationDTO mapTransportationToDTO(Transportation transportation) {
        if (transportation == null) return null;
        TransportationDTO dto = new TransportationDTO();
        dto.setId(transportation.getId());
        dto.setTransportationType(transportation.getTransportationType());
        dto.setOriginLocationId(transportation.getOriginLocation().getId());
        dto.setDestinationLocationId(transportation.getDestinationLocation().getId());
        dto.setOperatingDays(transportation.getOperatingDays());
        return dto;
    }
}