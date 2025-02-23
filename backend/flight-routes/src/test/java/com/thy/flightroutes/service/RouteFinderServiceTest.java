package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.repository.TransportationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RouteFinderServiceTest {
    @Mock
    private TransportationRepository transportationRepository;

    @InjectMocks
    private RouteFinderService routeFinderService;

    private Location taksim;
    private Location istanbulAirport;
    private Location heathrowAirport;
    private Location wembleyStadium;

    @BeforeEach
    void setUp() {
        taksim = createLocation(1L, "Taksim Square", "Turkey", "Istanbul", "CCIST");
        istanbulAirport = createLocation(2L, "Istanbul Airport", "Turkey", "Istanbul", "IST");
        heathrowAirport = createLocation(3L, "Heathrow Airport", "UK", "London", "LHR");
        wembleyStadium = createLocation(4L, "Wembley Stadium", "UK", "London", "CCLON");
    }

    @Test
    void shouldFindDirectFlight() {
        // Given
        Transportation directFlight = createFlight(istanbulAirport, heathrowAirport, Set.of(1, 3, 5));
        when(transportationRepository.findByTransportationType(TransportationType.FLIGHT))
                .thenReturn(List.of(directFlight));

        // When
        List<RouteDTO> routes = routeFinderService.findAllRoutes(istanbulAirport, heathrowAirport, 3);

        // Then
        assertThat(routes).hasSize(1);
        RouteDTO route = routes.get(0);
        assertThat(route.getBeforeFlight()).isNull();
        assertThat(route.getFlight()).isNotNull();
        assertThat(route.getAfterFlight()).isNull();
    }

    @Test
    void shouldFindRouteWithTransfers() {
        // Given
        Transportation busToAirport = createTransportation(
                taksim, istanbulAirport, TransportationType.BUS, Set.of(1,2,3,4,5));
        Transportation flight = createFlight(
                istanbulAirport, heathrowAirport, Set.of(1,3,5));
        Transportation uberToStadium = createTransportation(
                heathrowAirport, wembleyStadium, TransportationType.UBER, Set.of(1,2,3,4,5));

        when(transportationRepository.findByTransportationType(TransportationType.FLIGHT))
                .thenReturn(List.of(flight));
        when(transportationRepository.findByDestinationLocationAndTransportationType(
                istanbulAirport, TransportationType.FLIGHT))
                .thenReturn(List.of(busToAirport));
        when(transportationRepository.findByOriginLocationAndTransportationType(
                heathrowAirport, TransportationType.FLIGHT))
                .thenReturn(List.of(uberToStadium));

        // When
        List<RouteDTO> routes = routeFinderService.findAllRoutes(taksim, wembleyStadium, 3);

        // Then
        assertThat(routes).hasSize(1);
        RouteDTO route = routes.get(0);
        assertThat(route.getBeforeFlight()).isNotNull();
        assertThat(route.getBeforeFlight().getTransportationType()).isEqualTo(TransportationType.BUS);
        assertThat(route.getFlight()).isNotNull();
        assertThat(route.getAfterFlight()).isNotNull();
        assertThat(route.getAfterFlight().getTransportationType()).isEqualTo(TransportationType.UBER);
    }

    @Test
    void shouldNotFindRouteWhenFlightNotAvailable() {
        // Given
        Transportation flight = createFlight(istanbulAirport, heathrowAirport, Set.of(1, 5));
        when(transportationRepository.findByTransportationType(TransportationType.FLIGHT))
                .thenReturn(List.of(flight));

        // When
        List<RouteDTO> routes = routeFinderService.findAllRoutes(istanbulAirport, heathrowAirport, 3);

        // Then
        assertThat(routes).isEmpty();
    }

    @Test
    void shouldNotCreateInvalidRoutes() {
        // Given - Two consecutive flights
        Transportation flight1 = createFlight(taksim, istanbulAirport, Set.of(1,3,5));
        Transportation flight2 = createFlight(istanbulAirport, heathrowAirport, Set.of(1,3,5));
        when(transportationRepository.findByTransportationType(TransportationType.FLIGHT))
                .thenReturn(List.of(flight1, flight2));

        // When
        List<RouteDTO> routes = routeFinderService.findAllRoutes(taksim, heathrowAirport, 3);

        // Then
        assertThat(routes).isEmpty();
    }

    private Location createLocation(Long id, String name, String country, String city, String code) {
        Location location = new Location();
        location.setId(id);
        location.setName(name);
        location.setCountry(country);
        location.setCity(city);
        location.setLocationCode(code);
        return location;
    }

    private Transportation createFlight(Location origin, Location destination, Set<Integer> days) {
        return createTransportation(origin, destination, TransportationType.FLIGHT, days);
    }

    private Transportation createTransportation(
            Location origin,
            Location destination,
            TransportationType type,
            Set<Integer> days) {
        Transportation transport = new Transportation();
        transport.setOriginLocation(origin);
        transport.setDestinationLocation(destination);
        transport.setTransportationType(type);
        transport.setOperatingDays(days);
        return transport;
    }
}