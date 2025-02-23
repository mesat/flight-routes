package com.thy.flightroutes.dto;

import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    private TransportationDTO beforeFlight;
    private TransportationDTO flight;
    private TransportationDTO afterFlight;

    private String originLocationName;
    private String destinationLocationName;

    // Helper method to check if this is a valid route
    public boolean isValid() {
        // Must have a flight
        if (flight == null || flight.getTransportationType() != TransportationType.FLIGHT) {
            return false;
        }

        // Can't have more than one before/after flight transfer
        if (beforeFlight != null && beforeFlight.getTransportationType() == TransportationType.FLIGHT) {
            return false;
        }

        if (afterFlight != null && afterFlight.getTransportationType() == TransportationType.FLIGHT) {
            return false;
        }

        return true;
    }
}
