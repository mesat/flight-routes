package com.thy.flightroutes.repository;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository
public interface TransportationRepository extends JpaRepository<Transportation, Long> {
    List<Transportation> findByOriginLocationAndDestinationLocation(
            Location originLocation,
            Location destinationLocation
    );
    List<Transportation> findByOriginLocationInAndDestinationLocationInAndTransportationTypeAndOperatingDaysContaining(
            Collection<Location> originLocation, Collection<Location> destinationLocation, TransportationType transportationType, Integer operatingDays
    );

    List<Transportation> findByOriginLocationAndTransportationType(
            Location originLocation,
            TransportationType type
    );
    List<Transportation> findByOriginLocationAndTransportationTypeNotAndOperatingDaysContaining(
            Location originLocation, TransportationType transportationType, Integer operatingDays
    );
    List<Transportation> findByDestinationLocationAndTransportationTypeNotAndOperatingDaysContaining(
            Location originLocation, TransportationType transportationType, Integer operatingDays
    );

    List<Transportation> findByDestinationLocationAndTransportationType(
            Location destinationLocation,
            TransportationType type
    );

    List<Transportation> findByTransportationType(TransportationType type);

}