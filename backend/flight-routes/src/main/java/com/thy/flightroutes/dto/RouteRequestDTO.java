package com.thy.flightroutes.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern="yyyy-MM-dd")
    private LocalDate date;
}
