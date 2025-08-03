package com.thy.flightroutes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "transportations", uniqueConstraints =
@UniqueConstraint(
        name = "transp_orig_dest_type_pk",
        columnNames = {"origin_location_id","destination_location_id", "transportation_type" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transportation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_location_id", nullable = false)
    private Location originLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransportationType transportationType;

    @ElementCollection
    @CollectionTable(name = "transportation_operating_days",
            joinColumns = @JoinColumn(name = "transportation_id"))
    private Set<Integer> operatingDays = new HashSet<>();

    public enum TransportationType {
        FLIGHT, BUS, SUBWAY, UBER
    }
}
