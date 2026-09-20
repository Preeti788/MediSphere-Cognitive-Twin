package com.medisphere.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    /**
     * Kafka Producer Factory
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {

        Map<String, Object> config = new HashMap<>();

        // Kafka server
        config.put(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
            bootstrapServers
        );

        // Message key serializer
        config.put(
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
            StringSerializer.class
        );

        // Message value serializer - JSON
        config.put(
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
            JsonSerializer.class
        );

        // Reliability
        config.put(
            ProducerConfig.ACKS_CONFIG,
            "all"
        );

        // Retry failed messages
        config.put(
            ProducerConfig.RETRIES_CONFIG,
            3
        );

        // Prevent duplicate ordering problems
        config.put(
            ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG,
            true
        );

        return new DefaultKafkaProducerFactory<>(config);
    }

    /**
     * KafkaTemplate used by MediSphereController
     * to publish real-time healthcare events.
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}