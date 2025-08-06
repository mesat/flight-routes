package com.thy.flightroutes.repository;

import com.thy.flightroutes.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByLocationCode(String locationCode);
    List<Location> findByCity(String city);
    
    @Query("SELECT l FROM Location l WHERE " +
           "LOWER(l.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(l.locationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Location> findBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT l FROM Location l WHERE " +
           "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(l.name), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ı', 'i'), 'ö', 'o'), 'ç', 'c') LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(l.city), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ı', 'i'), 'ö', 'o'), 'ç', 'c') LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(l.country), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ı', 'i'), 'ö', 'o'), 'ç', 'c') LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(LOWER(l.locationCode), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ı', 'i'), 'ö', 'o'), 'ç', 'c') LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Location> findBySearchTermNormalized(@Param("searchTerm") String searchTerm, Pageable pageable);
}