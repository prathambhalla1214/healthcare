package com.example.healthcare.controller;

import com.example.healthcare.model.DoctorAvailability;
import com.example.healthcare.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/doctor-availability")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    public ResponseEntity<DoctorAvailability> addAvailability(
            @RequestParam Long doctorId,
            @RequestParam String startTime,
            @RequestParam String endTime
    ) {
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        return ResponseEntity.ok(availabilityService.addAvailability(doctorId, start, end));
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> getAvailabilityForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityForDoctor(doctorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeAvailability(@PathVariable Long id) {
        availabilityService.removeAvailability(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{doctorId}/check")
    public ResponseEntity<Boolean> isDoctorAvailable(
            @PathVariable Long doctorId,
            @RequestParam String startTime,
            @RequestParam String endTime
    ) {
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        return ResponseEntity.ok(availabilityService.isDoctorAvailable(doctorId, start, end));
    }
}
