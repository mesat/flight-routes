package com.thy.flightroutes.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String city;

    @Column(name = "location_code", nullable = false, unique = true)
    private String locationCode;

    @OneToMany(mappedBy = "originLocation")
    private Set<Transportation> departingTransportations = new HashSet<>();

    @OneToMany(mappedBy = "destinationLocation")
    private Set<Transportation> arrivingTransportations = new HashSet<>();
}