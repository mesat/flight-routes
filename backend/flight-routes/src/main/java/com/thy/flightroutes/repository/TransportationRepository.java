package com.thy.flightroutes.repository;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import com.thy.flightroutes.entity.Transportation.TransportationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TransportationRepository extends JpaRepository<Transportation, Long> {
    
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation")
    List<Transportation> findAllWithLocations();
    
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation")
    Page<Transportation> findAllWithLocations(Pageable pageable);
    
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation " +
           "WHERE t.originLocation = :originLocation AND t.destinationLocation = :destinationLocation")
    List<Transportation> findByOriginLocationAndDestinationLocationWithLocations(
            @Param("originLocation") Location originLocation,
            @Param("destinationLocation") Location destinationLocation
    );
    
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation " +
           "WHERE t.originLocation = :originLocation AND t.destinationLocation = :destinationLocation")
    Page<Transportation> findByOriginLocationAndDestinationLocationWithLocations(
            @Param("originLocation") Location originLocation,
            @Param("destinationLocation") Location destinationLocation,
            Pageable pageable
    );
    
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
            Location destinationLocation, TransportationType transportationType, Integer operatingDays
    );

    List<Transportation> findByDestinationLocationAndTransportationType(
            Location destinationLocation,
            TransportationType type
    );

    List<Transportation> findByTransportationType(TransportationType type);

    @Query("SELECT DISTINCT t.operatingDays FROM Transportation t " +
           "JOIN t.operatingDays od " +
           "WHERE t.originLocation IN :originLocations " +
           "AND t.destinationLocation IN :destinationLocations " +
           "AND t.transportationType = :transportationType")
    List<Integer> findOperatingDaysByOriginLocationsAndDestinationLocationsAndTransportationType(
            @Param("originLocations") Collection<Location> originLocations,
            @Param("destinationLocations") Collection<Location> destinationLocations,
            @Param("transportationType") TransportationType transportationType
    );

    @Query("SELECT DISTINCT t.transportationType FROM Transportation t")
    List<TransportationType> findDistinctTransportationTypes();

    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation ol " +
           "JOIN FETCH t.destinationLocation dl " +
           "WHERE (:searchTerm IS NULL OR " +
           "LOWER(ol.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ol.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ol.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ol.locationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(dl.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(dl.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(dl.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(dl.locationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND (:transportationTypes IS NULL OR t.transportationType IN :transportationTypes)")
    Page<Transportation> findBySearchTermAndTransportationTypes(
            @Param("searchTerm") String searchTerm,
            @Param("transportationTypes") List<TransportationType> transportationTypes,
            Pageable pageable
    );
}