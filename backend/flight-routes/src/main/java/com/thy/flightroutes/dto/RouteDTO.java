package com.thy.flightroutes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteDTO {
    private TransportationDTO beforeFlight;
    private TransportationDTO flight;
    private TransportationDTO afterFlight;

    private String originLocationName;
    private String destinationLocationName;

    /**
     * Creates a deep copy of a RouteDTO
     * This ensures all nested objects are detached from Hibernate session
     *
     * @param routeDTO The RouteDTO to copy
     * @return A new RouteDTO with a copy of all properties
     */
    public static RouteDTO deepCopy(RouteDTO routeDTO) {
        if (routeDTO == null) {
            return null;
        }

        RouteDTO copy = new RouteDTO();
        copy.setOriginLocationName(routeDTO.getOriginLocationName());
        copy.setDestinationLocationName(routeDTO.getDestinationLocationName());

        // Copy beforeFlight if present
        if (routeDTO.getBeforeFlight() != null) {
            TransportationDTO beforeFlightCopy = new TransportationDTO();
            TransportationDTO original = routeDTO.getBeforeFlight();

            beforeFlightCopy.setId(original.getId());
            beforeFlightCopy.setOriginLocationId(original.getOriginLocationId());
            beforeFlightCopy.setDestinationLocationId(original.getDestinationLocationId());
            beforeFlightCopy.setTransportationType(original.getTransportationType());

            // Create new HashSet for operatingDays
            if (original.getOperatingDays() != null) {
                beforeFlightCopy.setOperatingDays(new HashSet<>(original.getOperatingDays()));
            }

            // Copy location DTOs
            if (original.getOriginLocation() != null) {
                beforeFlightCopy.setOriginLocation(new LocationDTO(
                        original.getOriginLocation().getId(),
                        original.getOriginLocation().getName(),
                        original.getOriginLocation().getCountry(),
                        original.getOriginLocation().getCity(),
                        original.getOriginLocation().getLocationCode(),
                        original.getOriginLocation().getIsAirport()
                ));
            }

            if (original.getDestinationLocation() != null) {
                beforeFlightCopy.setDestinationLocation(new LocationDTO(
                        original.getDestinationLocation().getId(),
                        original.getDestinationLocation().getName(),
                        original.getDestinationLocation().getCountry(),
                        original.getDestinationLocation().getCity(),
                        original.getDestinationLocation().getLocationCode(),
                        original.getDestinationLocation().getIsAirport()
                ));
            }

            copy.setBeforeFlight(beforeFlightCopy);
        }

        // Copy flight (mandatory)
        if (routeDTO.getFlight() != null) {
            TransportationDTO flightCopy = new TransportationDTO();
            TransportationDTO original = routeDTO.getFlight();

            flightCopy.setId(original.getId());
            flightCopy.setOriginLocationId(original.getOriginLocationId());
            flightCopy.setDestinationLocationId(original.getDestinationLocationId());
            flightCopy.setTransportationType(original.getTransportationType());

            // Create new HashSet for operatingDays
            if (original.getOperatingDays() != null) {
                flightCopy.setOperatingDays(new HashSet<>(original.getOperatingDays()));
            }

            // Copy location DTOs
            if (original.getOriginLocation() != null) {
                flightCopy.setOriginLocation(new LocationDTO(
                        original.getOriginLocation().getId(),
                        original.getOriginLocation().getName(),
                        original.getOriginLocation().getCountry(),
                        original.getOriginLocation().getCity(),
                        original.getOriginLocation().getLocationCode(),
                        original.getOriginLocation().getIsAirport()
                ));
            }

            if (original.getDestinationLocation() != null) {
                flightCopy.setDestinationLocation(new LocationDTO(
                        original.getDestinationLocation().getId(),
                        original.getDestinationLocation().getName(),
                        original.getDestinationLocation().getCountry(),
                        original.getDestinationLocation().getCity(),
                        original.getDestinationLocation().getLocationCode(),
                        original.getDestinationLocation().getIsAirport()
                ));
            }

            copy.setFlight(flightCopy);
        }

        // Copy afterFlight if present
        if (routeDTO.getAfterFlight() != null) {
            TransportationDTO afterFlightCopy = new TransportationDTO();
            TransportationDTO original = routeDTO.getAfterFlight();

            afterFlightCopy.setId(original.getId());
            afterFlightCopy.setOriginLocationId(original.getOriginLocationId());
            afterFlightCopy.setDestinationLocationId(original.getDestinationLocationId());
            afterFlightCopy.setTransportationType(original.getTransportationType());

            // Create new HashSet for operatingDays
            if (original.getOperatingDays() != null) {
                afterFlightCopy.setOperatingDays(new HashSet<>(original.getOperatingDays()));
            }

            // Copy location DTOs
            if (original.getOriginLocation() != null) {
                afterFlightCopy.setOriginLocation(new LocationDTO(
                        original.getOriginLocation().getId(),
                        original.getOriginLocation().getName(),
                        original.getOriginLocation().getCountry(),
                        original.getOriginLocation().getCity(),
                        original.getOriginLocation().getLocationCode(),
                        original.getOriginLocation().getIsAirport()
                ));
            }

            if (original.getDestinationLocation() != null) {
                afterFlightCopy.setDestinationLocation(new LocationDTO(
                        original.getDestinationLocation().getId(),
                        original.getDestinationLocation().getName(),
                        original.getDestinationLocation().getCountry(),
                        original.getDestinationLocation().getCity(),
                        original.getDestinationLocation().getLocationCode(),
                        original.getDestinationLocation().getIsAirport()
                ));
            }

            copy.setAfterFlight(afterFlightCopy);
        }

        return copy;
    }
}