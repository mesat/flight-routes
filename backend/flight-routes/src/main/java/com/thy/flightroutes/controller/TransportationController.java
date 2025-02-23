package com.thy.flightroutes.controller;

import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.service.TransportationService;
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
            description = "Returns a list of all transportation routes in the system"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transportations",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransportationDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public List<TransportationDTO> getAllTransportations() {
        return transportationService.getAllTransportations();
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

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Search transportations",
            description = "Search transportations by origin and destination locations"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved transportations",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TransportationDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Location not found")
    })
    public List<TransportationDTO> searchTransportations(
            @Parameter(description = "Origin location ID", required = true)
            @RequestParam Long originId,
            @Parameter(description = "Destination location ID", required = true)
            @RequestParam Long destinationId) {
        return transportationService.getTransportationsByLocations(originId, destinationId);
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
}