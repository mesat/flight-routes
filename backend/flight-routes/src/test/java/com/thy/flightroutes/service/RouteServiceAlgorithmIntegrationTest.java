package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Transportation;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class RouteServiceAlgorithmIntegrationTest {

    @Autowired
    private LocationService locationService;

    @Autowired
    private TransportationService transportationService;

    @Autowired
    private RouteService routeService;

    private void createTransportation(Long originId,
                                      Long destinationId,
                                      Transportation.TransportationType type,
                                      Set<Integer> operatingDays) {
        TransportationDTO dto = new TransportationDTO();
        dto.setOriginLocationId(originId);
        dto.setDestinationLocationId(destinationId);
        dto.setTransportationType(type);
        dto.setOperatingDays(operatingDays);
        transportationService.createTransportation(dto);
    }

    private LocalDate pickMatchingDate(Set<Integer> operatingDays) {
        LocalDate date = LocalDate.now();
        for (int i = 0; i < 7; i++) {
            if (operatingDays.contains(date.getDayOfWeek().getValue())) {
                return date;
            }
            date = date.plusDays(1);
        }
        return LocalDate.now();
    }

    @Test
    void findRoutes_withBeforeFlight_returnsRouteWithBeforeSegment() {
        LocationDTO ccIstanbul = locationService.createLocation(new LocationDTO(
                null, "Taksim Square", "Türkiye", "İstanbul", "CCIST"));
        LocationDTO istAirport = locationService.getLocationByCode("IST");
        LocationDTO lhrAirport = locationService.getLocationByCode("LHR");

        createTransportation(ccIstanbul.getId(), istAirport.getId(),
                Transportation.TransportationType.BUS, Set.of(1,2,3,4,5,6,7));
        Set<Integer> flightDays = Set.of(1,2,3,4,5);
        createTransportation(istAirport.getId(), lhrAirport.getId(),
                Transportation.TransportationType.FLIGHT, flightDays);

        LocalDate date = pickMatchingDate(flightDays);
        RouteRequestDTO request = new RouteRequestDTO();
        request.setOriginLocationCode("CCIST");
        request.setDestinationLocationCode("LHR");
        request.setDate(date);

        List<RouteDTO> routes = routeService.findRoutes(request);
        assertThat(routes).hasSize(1);
        RouteDTO route = routes.get(0);
        assertNotNull(route.getBeforeFlight());
        assertNull(route.getAfterFlight());
        assertThat(route.getOriginLocationName()).isEqualTo("Taksim Square");
        assertThat(route.getDestinationLocationName()).isEqualTo("Heathrow");
    }

    @Test
    void findRoutes_withAfterFlight_returnsRouteWithAfterSegment() {
        LocationDTO istAirport = locationService.createLocation(new LocationDTO(
                null, "İstanbul Havalimanı", "Türkiye", "İstanbul", "IST"));
        LocationDTO lhrAirport = locationService.createLocation(new LocationDTO(
                null, "Heathrow", "İngiltere", "Londra", "LHR"));
        LocationDTO ccLondon = locationService.createLocation(new LocationDTO(
                null, "Trafalgar Square", "İngiltere", "Londra", "CCLON"));

        Set<Integer> flightDays = Set.of(DayOfWeek.SATURDAY.getValue(), DayOfWeek.SUNDAY.getValue());
        createTransportation(istAirport.getId(), lhrAirport.getId(),
                Transportation.TransportationType.FLIGHT, flightDays);
        createTransportation(lhrAirport.getId(), ccLondon.getId(),
                Transportation.TransportationType.SUBWAY, Set.of(1,2,3,4,5,6,7));

        LocalDate date = pickMatchingDate(flightDays);
        RouteRequestDTO request = new RouteRequestDTO();
        request.setOriginLocationCode("IST");
        request.setDestinationLocationCode("CCLON");
        request.setDate(date);

        List<RouteDTO> routes = routeService.findRoutes(request);
        assertThat(routes).hasSize(1);
        RouteDTO route = routes.get(0);
        assertNull(route.getBeforeFlight());
        assertNotNull(route.getAfterFlight());
        assertThat(route.getOriginLocationName()).isEqualTo("İstanbul Havalimanı");
        assertThat(route.getDestinationLocationName()).isEqualTo("Trafalgar Square");
    }

    @Test
    void findRoutes_withBeforeAndAfterFlight_returnsRouteWithBothSegments() {
        LocationDTO ccIstanbul = locationService.createLocation(new LocationDTO(
                null, "Taksim Square", "Türkiye", "İstanbul", "CCIST"));
        LocationDTO istAirport = locationService.createLocation(new LocationDTO(
                null, "İstanbul Havalimanı", "Türkiye", "İstanbul", "IST"));
        LocationDTO lhrAirport = locationService.createLocation(new LocationDTO(
                null, "Heathrow", "İngiltere", "Londra", "LHR"));
        LocationDTO ccLondon = locationService.createLocation(new LocationDTO(
                null, "Trafalgar Square", "İngiltere", "Londra", "CCLON"));

        createTransportation(ccIstanbul.getId(), istAirport.getId(),
                Transportation.TransportationType.UBER, Set.of(1,2,3,4,5,6,7));
        createTransportation(lhrAirport.getId(), ccLondon.getId(),
                Transportation.TransportationType.BUS, Set.of(1,2,3,4,5,6,7));
        Set<Integer> flightDays = Set.of(1,2,3,4,5);
        createTransportation(istAirport.getId(), lhrAirport.getId(),
                Transportation.TransportationType.FLIGHT, flightDays);

        LocalDate date = pickMatchingDate(flightDays);
        RouteRequestDTO request = new RouteRequestDTO();
        request.setOriginLocationCode("CCIST");
        request.setDestinationLocationCode("CCLON");
        request.setDate(date);

        List<RouteDTO> routes = routeService.findRoutes(request);
        assertThat(routes).hasSize(1);
        RouteDTO route = routes.get(0);
        assertNotNull(route.getBeforeFlight());
        assertNotNull(route.getAfterFlight());
        assertThat(route.getOriginLocationName()).isEqualTo("Taksim Square");
        assertThat(route.getDestinationLocationName()).isEqualTo("Trafalgar Square");
    }

    @Test
    void findRoutes_withMultipleTransfers_producesCombinations() {
        LocationDTO ccIstanbul1 = locationService.createLocation(new LocationDTO(
                null, "Taksim Square", "Türkiye", "İstanbul", "CCIST"));
        LocationDTO ccIstanbul2 = locationService.createLocation(new LocationDTO(
                null, "Kadıköy", "Türkiye", "İstanbul", "CKADK"));
        LocationDTO istAirport = locationService.createLocation(new LocationDTO(
                null, "İstanbul Havalimanı", "Türkiye", "İstanbul", "IST"));
        LocationDTO lhrAirport = locationService.createLocation(new LocationDTO(
                null, "Heathrow", "İngiltere", "Londra", "LHR"));
        LocationDTO ccLondon1 = locationService.createLocation(new LocationDTO(
                null, "Trafalgar Square", "İngiltere", "Londra", "CCLON"));
        LocationDTO ccLondon2 = locationService.createLocation(new LocationDTO(
                null, "Canary Wharf", "İngiltere", "Londra", "CCLON2"));

        createTransportation(ccIstanbul1.getId(), istAirport.getId(),
                Transportation.TransportationType.BUS, Set.of(1,2,3,4,5,6,7));
        createTransportation(ccIstanbul2.getId(), istAirport.getId(),
                Transportation.TransportationType.SUBWAY, Set.of(1,2,3,4,5,6,7));
        createTransportation(lhrAirport.getId(), ccLondon1.getId(),
                Transportation.TransportationType.UBER, Set.of(1,2,3,4,5,6,7));
        createTransportation(lhrAirport.getId(), ccLondon2.getId(),
                Transportation.TransportationType.BUS, Set.of(1,2,3,4,5,6,7));
        Set<Integer> flightDays = Set.of(1,2,3,4,5);
        createTransportation(istAirport.getId(), lhrAirport.getId(),
                Transportation.TransportationType.FLIGHT, flightDays);

        LocalDate date = pickMatchingDate(flightDays);
        RouteRequestDTO request = new RouteRequestDTO();
        request.setOriginLocationCode("CCIST");
        request.setDestinationLocationCode("CCLON");
        request.setDate(date);

        List<RouteDTO> routes = routeService.findRoutes(request);
        assertThat(routes).hasSize(4);
    }
}