package com.thy.flightroutes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequestDTO {
    private String originLocationCode;
    private String destinationLocationCode;
    private LocalDate date;
}
