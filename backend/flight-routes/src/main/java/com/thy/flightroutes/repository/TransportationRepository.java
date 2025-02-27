package com.thy.flightroutes.repository;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportationRepository extends JpaRepository<Transportation, Long> {
    List<Transportation> findByOriginLocationAndDestinationLocation(
            Location originLocation,
            Location destinationLocation
    );

    List<Transportation> findByOriginLocationAndTransportationType(
            Location originLocation,
            TransportationType type
    );

    List<Transportation> findByDestinationLocationAndTransportationType(
            Location destinationLocation,
            TransportationType type
    );

    List<Transportation> findByTransportationType(TransportationType type);

}