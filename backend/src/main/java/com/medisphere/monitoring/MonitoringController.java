package com.medisphere.monitoring;

import com.medisphere.model.Models.Vital;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final MonitoringService monitoring;

    public MonitoringController(MonitoringService monitoring) {
        this.monitoring = monitoring;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return monitoring.overview();
    }

    @GetMapping("/patient/{patientId}")
    public Map<String, Object> patient(@PathVariable String patientId) {
        return monitoring.patient(patientId);
    }

    @PostMapping("/evaluate")
    public Map<String, Object> evaluate(@RequestBody Vital vital) {
        return Map.of(
                "status", monitoring.status(vital),
                "alerts", monitoring.evaluate(vital)
        );
    }

    @KafkaListener(
            topics = "${medisphere.kafka-topic}",
            groupId = "medisphere-monitoring"
    )
    public void consumeVital(String payload) {
        /*
         * Kafka payload deserialization is handled by the existing
         * vital ingestion flow. This listener is intentionally kept
         * lightweight so the backend can also operate through the
         * synchronous /api/vitals fallback.
         */
    }
}