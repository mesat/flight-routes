package com.thy.flightroutes.controller;

import com.thy.flightroutes.dto.PageResponseDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.service.TransportationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transportations")
@Tag(name = "Transportation Management", description = "Endpoints for managing transportations")
@RequiredArgsConstructor
public class TransportationController {
    private final TransportationService transportationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get all transportations",
            description = "Returns a paginated list of all transportation routes in the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transportations",
                    content = @Content(schema = @Schema(implementation = PageResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public PageResponseDTO<TransportationDTO> getAllTransportations(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        return transportationService.getAllTransportations(page, size);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create a new transportation",
            description = "Creates a new transportation route with the provided details"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transportation successfully created",
                    content = @Content(schema = @Schema(implementation = TransportationDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Location not found")
    })
    public ResponseEntity<TransportationDTO> createTransportation(
            @Parameter(description = "Transportation details", required = true)
            @Valid @RequestBody TransportationDTO transportationDTO) {
        TransportationDTO created = transportationService.createTransportation(transportationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/types")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get all transportation types",
            description = "Returns all available transportation types in the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transportation types"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<List<String>> getAllTransportationTypes() {
        List<String> types = transportationService.getAllTransportationTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get all transportations for search",
            description = "Returns all transportation routes for client-side filtering and search"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all transportations"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<List<TransportationDTO>> getAllTransportationsForSearch() {
        List<TransportationDTO> transportations = transportationService.getAllTransportationsForSearch();
        return ResponseEntity.ok(transportations);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Search transportations",
            description = "Search transportations by origin and destination locations with pagination"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transportations",
                    content = @Content(schema = @Schema(implementation = PageResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Location not found")
    })
    public PageResponseDTO<TransportationDTO> searchTransportations(
            @Parameter(description = "Origin location ID", required = true)
            @RequestParam Long originId,
            @Parameter(description = "Destination location ID", required = true)
            @RequestParam Long destinationId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        return transportationService.getTransportationsByLocations(originId, destinationId, page, size);
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Filter and search transportations",
            description = "Filter transportations by search term and transportation types with pagination"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered transportations",
                    content = @Content(schema = @Schema(implementation = PageResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public PageResponseDTO<TransportationDTO> filterTransportations(
            @Parameter(description = "Search term for locations", required = false)
            @RequestParam(required = false) String searchTerm,
            @Parameter(description = "Transportation types to filter by", required = false)
            @RequestParam(required = false) List<String> transportationTypes,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        return transportationService.filterTransportations(searchTerm, transportationTypes, page, size);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Update transportation",
            description = "Updates an existing transportation route with the provided details"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transportation successfully updated",
                    content = @Content(schema = @Schema(implementation = TransportationDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Transportation not found")
    })
    public TransportationDTO updateTransportation(
            @Parameter(description = "Transportation ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated transportation details", required = true)
            @Valid @RequestBody TransportationDTO transportationDTO) {
        return transportationService.updateTransportation(id, transportationDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Delete transportation",
            description = "Deletes a transportation route by its ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Transportation successfully deleted"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Transportation not found")
    })
    public ResponseEntity<Void> deleteTransportation(
            @Parameter(description = "Transportation ID", required = true)
            @PathVariable Long id) {
        transportationService.deleteTransportation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cache/clear")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = {"transportations_search", "transportations_paginated", "transportations_by_locations", "transportations_types", "transportations_filtered", "routes"}, allEntries = true)
    @Operation(
            summary = "Clear transportation cache",
            description = "Clears all transportation-related caches to force reload of data"
    )
    public ResponseEntity<String> clearCache() {
        return ResponseEntity.ok("All transportation caches cleared successfully");
    }
}