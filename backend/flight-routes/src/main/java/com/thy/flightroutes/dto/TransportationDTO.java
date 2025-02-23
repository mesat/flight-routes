package com.thy.flightroutes.dto;

import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.validator.EnumValidators;
import com.thy.flightroutes.validator.OperatingDaysValidator;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

import static com.thy.flightroutes.entity.Transportation.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransportationDTO {
    private Long id;

    @NotNull(message = "Origin location is required")
    private Long originLocationId;

    @NotNull(message = "Destination location is required")
    private Long destinationLocationId;

    @NotNull(message = "Transportation type is required")
    @EnumValidators(enumClass = TransportationType.class, message = "Invalid transportation type")
    private TransportationType transportationType;

    @NotEmpty(message = "Operating days are required")
    @OperatingDaysValidator(message = "Operating days must be between 1 and 7")
    private Set<Integer> operatingDays;
}


