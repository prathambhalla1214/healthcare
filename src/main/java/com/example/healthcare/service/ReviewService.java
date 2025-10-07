package com.example.healthcare.service;

import com.example.healthcare.model.Review;
import com.example.healthcare.model.Doctor;
import com.example.healthcare.model.Patient;
import com.example.healthcare.model.Appointment;
import com.example.healthcare.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @Transactional
    public Review createReview(Long patientId, Long doctorId, Long appointmentId, Integer rating, String comment) {
        Patient patient = patientService.getPatientById(patientId);
        Doctor doctor = doctorService.getDoctorById(doctorId);
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);

        if (!appointment.getPatient().getId().equals(patientId) || !appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Appointment does not match patient or doctor");
        }

        if (reviewRepository.existsByPatientAndDoctor(patient, doctor)) {
            throw new RuntimeException("Patient has already reviewed this doctor");
        }

        Review review = new Review();
        review.setPatient(patient);
        review.setDoctor(doctor);
        review.setAppointment(appointment);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByDoctor(Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return reviewRepository.findByDoctor(doctor);
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsByPatient(Long patientId) {
        Patient patient = patientService.getPatientById(patientId);
        return reviewRepository.findByPatient(patient);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        reviewRepository.delete(review);
    }
}
