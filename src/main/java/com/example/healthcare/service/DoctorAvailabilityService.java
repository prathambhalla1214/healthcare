package com.example.healthcare.service;

import com.example.healthcare.model.Doctor;
import com.example.healthcare.model.DoctorAvailability;
import com.example.healthcare.repository.DoctorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorService doctorService;

    @Transactional
    public DoctorAvailability addAvailability(Long doctorId, LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime.isBefore(startTime)) {
            throw new RuntimeException("End time cannot be before start time");
        }

        Doctor doctor = doctorService.getDoctorById(doctorId);

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setStartTime(LocalTime.from(startTime));
        availability.setEndTime(LocalTime.from(endTime));

        return availabilityRepository.save(availability);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailability> getAvailabilityForDoctor(Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return availabilityRepository.findByDoctor(doctor);
    }

    @Transactional
    public void removeAvailability(Long availabilityId) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found with id: " + availabilityId));
        availabilityRepository.delete(availability);
    }

    @Transactional(readOnly = true)
    public boolean isDoctorAvailable(Long doctorId, LocalDateTime startTime, LocalDateTime endTime) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        List<DoctorAvailability> overlaps = availabilityRepository.findByDoctorAndStartTimeBeforeAndEndTimeAfter(
                doctor, endTime, startTime
        );
        return !overlaps.isEmpty();
    }
}
