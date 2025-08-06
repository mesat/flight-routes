package com.thy.flightroutes.dto;

import com.thy.flightroutes.entity.Location;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 100, message = "Country must be between 2 and 100 characters")
    private String country;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    @NotBlank(message = "Location code is required")
    private String locationCode;

    @NotNull(message = "Airport status is required")
    private Boolean isAirport;

    /**
     * Creates a LocationDTO from a Location entity
     * @param entity The Location entity to convert
     * @return A new LocationDTO with data from the entity
     */
    public static LocationDTO fromEntity(Location entity) {
        if (entity == null) {
            return null;
        }

        LocationDTO dto = new LocationDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCountry(entity.getCountry());
        dto.setCity(entity.getCity());
        dto.setLocationCode(entity.getLocationCode());
        dto.setIsAirport(entity.getIsAirport());

        return dto;
    }
}