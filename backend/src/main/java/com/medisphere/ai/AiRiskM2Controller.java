package com.medisphere.ai;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/m2")
public class AiRiskM2Controller {
    private final AiRiskM2Service service;

    public AiRiskM2Controller(AiRiskM2Service service) {
        this.service = service;
    }

    @PostMapping("/risk/{patientId}")
    public Map<String, Object> risk(@PathVariable String patientId) {
        return service.predict(patientId);
    }
}
