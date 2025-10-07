package com.example.healthcare.repository;

import com.example.healthcare.model.Review;
import com.example.healthcare.model.Doctor;
import com.example.healthcare.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByDoctor(Doctor doctor);

    List<Review> findByPatient(Patient patient);

    boolean existsByPatientAndDoctor(Patient patient, Doctor doctor);
}
