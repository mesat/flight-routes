package com.thy.flightroutes.dto;

import com.thy.flightroutes.entity.Transportation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
public class TransportationDTO {
    private Long id;
    private Long originLocationId;
    private Long destinationLocationId;
    private Transportation.TransportationType transportationType;
    private Set<Integer> operatingDays = new HashSet<>();

    // Navigation properties for easier frontend usage
    private LocationDTO originLocation;
    private LocationDTO destinationLocation;

    // Constructor matching the one used in TransportationService
    public TransportationDTO(
            Long id,
            Long originLocationId,
            Long destinationLocationId,
            Transportation.TransportationType transportationType,
            Set<Integer> operatingDays) {
        this.id = id;
        this.originLocationId = originLocationId;
        this.destinationLocationId = destinationLocationId;
        this.transportationType = transportationType;
        this.operatingDays = operatingDays != null ? new HashSet<>(operatingDays) : new HashSet<>();
    }

    // Full constructor
    public TransportationDTO(
            Long id,
            Long originLocationId,
            Long destinationLocationId,
            Transportation.TransportationType transportationType,
            Set<Integer> operatingDays,
            LocationDTO originLocation,
            LocationDTO destinationLocation) {
        this.id = id;
        this.originLocationId = originLocationId;
        this.destinationLocationId = destinationLocationId;
        this.transportationType = transportationType;
        this.operatingDays = operatingDays != null ? new HashSet<>(operatingDays) : new HashSet<>();
        this.originLocation = originLocation;
        this.destinationLocation = destinationLocation;
    }

    /**
     * Creates a TransportationDTO from a Transportation entity
     * This method eagerly loads all properties, including lazy collections
     *
     * @param entity The Transportation entity to convert
     * @return A new TransportationDTO with data from the entity
     */
    public static TransportationDTO fromEntity(Transportation entity) {
        if (entity == null) {
            return null;
        }

        TransportationDTO dto = new TransportationDTO();
        dto.setId(entity.getId());

        // Handle originLocation
        if (entity.getOriginLocation() != null) {
            dto.setOriginLocationId(entity.getOriginLocation().getId());
            dto.setOriginLocation(LocationDTO.fromEntity(entity.getOriginLocation()));
        }

        // Handle destinationLocation
        if (entity.getDestinationLocation() != null) {
            dto.setDestinationLocationId(entity.getDestinationLocation().getId());
            dto.setDestinationLocation(LocationDTO.fromEntity(entity.getDestinationLocation()));
        }

        // Set transportationType
        dto.setTransportationType(entity.getTransportationType());

        // Copy operatingDays to a new HashSet to avoid lazy loading issues
        // This eagerly initializes the collection
        if (entity.getOperatingDays() != null) {
            dto.setOperatingDays(new HashSet<>(entity.getOperatingDays()));
        }

        return dto;
    }
}