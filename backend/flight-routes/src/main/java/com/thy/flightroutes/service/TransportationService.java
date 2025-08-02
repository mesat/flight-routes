package com.thy.flightroutes.service;

import com.thy.flightroutes.dto.TransportationDTO;
import com.thy.flightroutes.dto.PageResponseDTO;
import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.exception.ResourceNotFoundException;
import com.thy.flightroutes.repository.LocationRepository;
import com.thy.flightroutes.repository.TransportationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @Cacheable(value = "transportations", key = "'all_' + #page + '_' + #size")
    public PageResponseDTO<TransportationDTO> getAllTransportations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<Transportation> transportationPage = transportationRepository.findAllWithLocations(pageable);
        
        List<TransportationDTO> content = transportationPage.getContent().stream()
                .map(TransportationDTO::fromEntity)
                .collect(Collectors.toList());

        return new PageResponseDTO<>(
                content,
                page,
                size,
                transportationPage.getTotalElements(),
                transportationPage.getTotalPages(),
                transportationPage.hasNext(),
                transportationPage.hasPrevious(),
                transportationPage.isFirst(),
                transportationPage.isLast()
        );
    }

    @Cacheable(value = "transportations", key = "'by_locations_' + #originLocationId + '_' + #destinationLocationId + '_' + #page + '_' + #size")
    public PageResponseDTO<TransportationDTO> getTransportationsByLocations(Long originLocationId, Long destinationLocationId, int page, int size) {
        Location origin = locationRepository.findById(originLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Origin location not found: " + originLocationId));

        Location destination = locationRepository.findById(destinationLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination location not found: " + destinationLocationId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<Transportation> transportationPage = transportationRepository.findByOriginLocationAndDestinationLocationWithLocations(origin, destination, pageable);

        List<TransportationDTO> content = transportationPage.getContent().stream()
                .map(TransportationDTO::fromEntity)
                .collect(Collectors.toList());

        return new PageResponseDTO<>(
                content,
                page,
                size,
                transportationPage.getTotalElements(),
                transportationPage.getTotalPages(),
                transportationPage.hasNext(),
                transportationPage.hasPrevious(),
                transportationPage.isFirst(),
                transportationPage.isLast()
        );
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
        return TransportationDTO.fromEntity(transportation);
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
        return TransportationDTO.fromEntity(transportation);
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
}