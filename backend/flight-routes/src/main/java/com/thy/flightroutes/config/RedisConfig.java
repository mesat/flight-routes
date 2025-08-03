package com.thy.flightroutes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.database}")
    private int database;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration(redisHost, redisPort);
        configuration.setDatabase(database);
        return new LettuceConnectionFactory(configuration);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))  // Default TTL: 1 hour
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // Cache-specific TTL configurations - Optimized for different use cases
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Routes cache: 5 minutes (frequently changing, complex calculations)
        cacheConfigurations.put("routes", config.entryTtl(Duration.ofMinutes(5)));

        // Locations cache: 1 day (rarely changing, reference data)
        cacheConfigurations.put("locations", config.entryTtl(Duration.ofDays(1)));

        // Transportation caches with different TTLs based on usage patterns
        cacheConfigurations.put("transportations", config.entryTtl(Duration.ofMinutes(15))); // General cache
        cacheConfigurations.put("transportations_paginated", config.entryTtl(Duration.ofMinutes(10))); // Page-based results
        cacheConfigurations.put("transportations_search", config.entryTtl(Duration.ofMinutes(8))); // Search results
        cacheConfigurations.put("transportations_types", config.entryTtl(Duration.ofHours(2))); // Types rarely change
        cacheConfigurations.put("transportations_by_locations", config.entryTtl(Duration.ofMinutes(12))); // Location-based queries

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(config)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}