package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.RouteDTO;
import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteFinderService {
    private final TransportationRepository transportationRepository;



    /**
     * Transportation entity'sini TransportationDTO'ya çevirir.
     */
    private TransportationDTO mapToDTO(Transportation transportation) {
        if (transportation == null) return null;
        return new TransportationDTO(
                transportation.getId(),
                transportation.getOriginLocation().getId(),
                transportation.getDestinationLocation().getId(),
                transportation.getTransportationType(),
                transportation.getOperatingDays()
        );
    }
}