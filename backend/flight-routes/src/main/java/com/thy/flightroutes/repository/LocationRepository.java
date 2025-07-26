package com.thy.flightroutes.repository;

import com.thy.flightroutes.entity.Location;
import com.thy.flightroutes.entity.Transportation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByLocationCode(String locationCode);
    List<Location> findByCity(String city);
}