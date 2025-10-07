package com.example.healthcare.repository;

import com.example.healthcare.model.Doctor;
import com.example.healthcare.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorAndStartTimeBeforeAndEndTimeAfter(Doctor doctor, LocalDateTime start, LocalDateTime end);

    List<DoctorAvailability> findByDoctor(Doctor doctor);
}
