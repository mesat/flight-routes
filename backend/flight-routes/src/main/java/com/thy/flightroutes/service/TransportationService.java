package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TransportationService {
    private final TransportationRepository transportationRepository;
    private final LocationRepository locationRepository;

    @Cacheable(value = "transportations", key = "'all'")
    public List<TransportationDTO> getAllTransportations() {
        return transportationRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    //@Cacheable(value = "transportations",
            //key = "'origin_' + #originLocationId + '_dest_' + #destinationLocationId")
    public List<TransportationDTO> getTransportationsByLocations(Long originLocationId, Long destinationLocationId) {
        Location origin = locationRepository.findById(originLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Origin location not found: " + originLocationId));

        Location destination = locationRepository.findById(destinationLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + destinationLocationId));

        return transportationRepository.findByOriginLocationAndDestinationLocation(origin, destination)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = {"transportations", "routes"}, allEntries = true)
    public TransportationDTO createTransportation(TransportationDTO dto) {
        validateTransportation(dto);

        Location origin = locationRepository.findById(dto.getOriginLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Origin location not found: " + dto.getOriginLocationId()));

        Location destination = locationRepository.findById(dto.getDestinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + dto.getDestinationLocationId()));

        Transportation transportation = new Transportation();
        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setTransportationType(dto.getTransportationType());
        transportation.setOperatingDays(new HashSet<>(dto.getOperatingDays()));

        transportation = transportationRepository.save(transportation);
        return toDTO(transportation);
    }

    @CacheEvict(value = {"transportations", "routes"}, allEntries = true)
    public TransportationDTO updateTransportation(Long id, TransportationDTO dto) {
        validateTransportation(dto);

        Transportation transportation = transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation not found: " + id));

        Location origin = locationRepository.findById(dto.getOriginLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Origin location not found: " + dto.getOriginLocationId()));

        Location destination = locationRepository.findById(dto.getDestinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + dto.getDestinationLocationId()));

        transportation.setOriginLocation(origin);
        transportation.setDestinationLocation(destination);
        transportation.setTransportationType(dto.getTransportationType());
        transportation.setOperatingDays(new HashSet<>(dto.getOperatingDays()));

        transportation = transportationRepository.save(transportation);
        return toDTO(transportation);
    }

    @CacheEvict(value = {"transportations", "routes"}, allEntries = true)
    public void deleteTransportation(Long id) {
        if (!transportationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transportation not found: " + id);
        }
        transportationRepository.deleteById(id);
    }

    private void validateTransportation(TransportationDTO dto) {
        if (Objects.equals(dto.getOriginLocationId(), dto.getDestinationLocationId())) {
            throw new IllegalArgumentException("Origin and destination cannot be the same");
        }

        if (dto.getOperatingDays() == null || dto.getOperatingDays().isEmpty()) {
            throw new IllegalArgumentException("Operating days cannot be empty");
        }

        if (dto.getOperatingDays().stream().anyMatch(day -> day < 1 || day > 7)) {
            throw new IllegalArgumentException("Invalid operating day. Days must be between 1 and 7");
        }
    }

    private TransportationDTO toDTO(Transportation transportation) {
        return new TransportationDTO(
                transportation.getId(),
                transportation.getOriginLocation().getId(),
                transportation.getDestinationLocation().getId(),
                transportation.getTransportationType(),
                transportation.getOperatingDays()
        );
    }
}