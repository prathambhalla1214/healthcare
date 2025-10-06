package com.example.healthcare.repository;

import com.example.healthcare.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    List<Doctor> findBySpecialization(String specialization);

    List<Doctor> findByAvailable(Boolean available);

    List<Doctor> findBySpecializationAndAvailable(String specialization, Boolean available);

    boolean existsByEmail(String email);
}