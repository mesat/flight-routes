package com.thy.flightroutes.controller;

import com.thy.flightroutes.dto.LocationDTO;
import com.thy.flightroutes.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@Tag(name = "Location Management", description = "Endpoints for managing locations")
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all locations", description = "Returns a list of all locations in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved locations"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token is missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not have admin role")
    })
    public List<LocationDTO> getAllLocations() {
        return locationService.getAllLocations();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new location", description = "Creates a new location with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Location successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User does not have admin role")
    })
    public ResponseEntity<LocationDTO> createLocation(
            @Parameter(description = "Location details", required = true)
            @Valid @RequestBody LocationDTO locationDTO) {
        LocationDTO created = locationService.createLocation(locationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get location by code", description = "Returns a location by its location code")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved location"),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public LocationDTO getLocationByCode(
            @Parameter(description = "Location code (IATA or city code)", required = true, example = "IST")
            @PathVariable String code) {
        return locationService.getLocationByCode(code);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update location", description = "Updates an existing location with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Location successfully updated"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public LocationDTO updateLocation(
            @Parameter(description = "Location ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated location details", required = true)
            @Valid @RequestBody LocationDTO locationDTO) {
        return locationService.updateLocation(id, locationDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete location", description = "Deletes a location by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Location successfully deleted"),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<Void> deleteLocation(
            @Parameter(description = "Location ID", required = true)
            @PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}