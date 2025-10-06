package com.example.healthcare.service;

import com.example.healthcare.model.Appointment;
import com.example.healthcare.model.Appointment.AppointmentStatus;
import com.example.healthcare.model.Doctor;
import com.example.healthcare.model.Patient;
import com.example.healthcare.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @Transactional
    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDateTime appointmentDateTime, String symptoms) {
        Patient patient = patientService.getPatientById(patientId);
        Doctor doctor = doctorService.getDoctorById(doctorId);

        if (!doctor.getAvailable()) {
            throw new RuntimeException("Doctor is not available");
        }

        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date cannot be in the past");
        }

        // Check for conflicting appointments
        List<Appointment> conflictingAppointments = appointmentRepository.findByDoctorAndDateRange(
                doctorId,
                appointmentDateTime.minusMinutes(30),
                appointmentDateTime.plusMinutes(30)
        );

        if (!conflictingAppointments.isEmpty()) {
            throw new RuntimeException("Doctor already has an appointment at this time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(appointmentDateTime);
        appointment.setSymptoms(symptoms);
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findUpcomingAppointmentsByPatient(patientId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findUpcomingAppointmentsByDoctor(doctorId, LocalDateTime.now());
    }

    @Transactional
    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateAppointmentDetails(Long id, String diagnosis, String prescription, String notes) {
        Appointment appointment = getAppointmentById(id);
        appointment.setDiagnosis(diagnosis);
        appointment.setPrescription(prescription);
        appointment.setNotes(notes);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment rescheduleAppointment(Long id, LocalDateTime newDateTime) {
        Appointment appointment = getAppointmentById(id);

        if (newDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Appointment date cannot be in the past");
        }

        // Check for conflicts with new time
        List<Appointment> conflictingAppointments = appointmentRepository.findByDoctorAndDateRange(
                appointment.getDoctor().getId(),
                newDateTime.minusMinutes(30),
                newDateTime.plusMinutes(30)
        );

        // Remove current appointment from conflicts
        conflictingAppointments.removeIf(a -> a.getId().equals(id));

        if (!conflictingAppointments.isEmpty()) {
            throw new RuntimeException("Doctor already has an appointment at this time");
        }

        appointment.setAppointmentDateTime(newDateTime);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
}