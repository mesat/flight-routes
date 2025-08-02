package com.thy.flightroutes.controller;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.RouteRequestDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@Tag(name = "Route Search", description = "Endpoints for searching routes")
@RequiredArgsConstructor
public class RouteController {
    private final RouteService routeService;

    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCY')")
    @Operation(
            summary = "Search routes",
            description = "Search for available routes between two locations on a specific date"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved routes",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = RouteDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Location not found")
    })
    public ResponseEntity<List<RouteDTO>> searchRoutes(
            @Parameter(description = "Route search criteria", required = true)
            @Valid @RequestBody RouteRequestDTO request) {
        List<RouteDTO> routes = routeService.findRoutes(request);
        return ResponseEntity.ok(routes);
    }

    @PostMapping("/alternative-days")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENCY')")
    @Operation(
            summary = "Get alternative days",
            description = "Get alternative days when routes are available for the same route"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved alternative days",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = Integer.class)))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Location not found")
    })
    public ResponseEntity<List<Integer>> getAlternativeDays(
            @Parameter(description = "Route search criteria", required = true)
            @Valid @RequestBody RouteRequestDTO request) {
        List<Integer> alternativeDays = routeService.findAlternativeDays(request);
        return ResponseEntity.ok(alternativeDays);
    }

    @Schema(description = "Sample request body for route search")
    public static class RouteSearchExample {
        @Schema(
                description = "Origin location code (IATA or city code)",
                example = "IST",
                required = true
        )
        private String originLocationCode;

        @Schema(
                description = "Destination location code (IATA or city code)",
                example = "LHR",
                required = true
        )
        private String destinationLocationCode;

        @Schema(
                description = "Travel date (YYYY-MM-DD)",
                example = "2024-03-15",
                required = true
        )
        private String date;
    }

    @Schema(description = "Sample response for a route")
    public static class RouteResponseExample {
        @Schema(description = "Transfer before flight (optional)")
        private TransportationDTO beforeFlight;

        @Schema(description = "Main flight (required)")
        private TransportationDTO flight;

        @Schema(description = "Transfer after flight (optional)")
        private TransportationDTO afterFlight;

        @Schema(description = "Origin location name", example = "Istanbul Airport")
        private String originLocationName;

        @Schema(description = "Destination location name", example = "London Heathrow")
        private String destinationLocationName;
    }

    @Schema(description = "Example of a transportation segment")
    public static class TransportationExample {
        @Schema(description = "Transportation type", example = "FLIGHT",
                allowableValues = {"FLIGHT", "BUS", "SUBWAY", "UBER"})
        private String transportationType;

        @Schema(description = "Operating days", example = "[1,3,5,7]")
        private List<Integer> operatingDays;

        @Schema(description = "Origin location")
        private LocationDTO originLocation;

        @Schema(description = "Destination location")
        private LocationDTO destinationLocation;
    }

    @Schema(description = "Location information")
    public static class LocationExample {
        @Schema(description = "Location name", example = "Istanbul Airport")
        private String name;

        @Schema(description = "Country", example = "Turkey")
        private String country;

        @Schema(description = "City", example = "Istanbul")
        private String city;

        @Schema(description = "Location code", example = "IST")
        private String locationCode;
    }

    @Schema(description = "Error response")
    public static class ErrorExample {
        @Schema(description = "HTTP Status code", example = "400")
        private int status;

        @Schema(description = "Error message", example = "Validation error")
        private String message;

        @Schema(description = "Detailed error messages",
                example = "[\"originLocationCode: Invalid location code format\"]")
        private List<String> errors;
    }
}