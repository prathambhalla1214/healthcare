package com.example.healthcare.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 50)
    private String email;

    @Column(name = "phone_number", nullable = false, unique = true)
    private String phone_number;

    @Column(name="date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Transient
    private int age;

    @Enumerated(EnumType.STRING)
    @Column(name="gender", length = 20)
    private Gender gender;

    @Column(name="address", nullable = false, length = 500)
    private String address;

    @Column(name="city", nullable = false, length = 50)
    private String city;

    @Column(name="state", length = 50)
    private String state;

    @Column(name="country", nullable = false, length = 50)
    private String country;

    @Column(name="pin_code", nullable = false, length = 50)
    private String pinCode;

    @Column(name="medical_history", length = 1000)
    private String medicalHistory;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public int getAge(){
        return Period.between(dateOfBirth,LocalDate.now()).getYears();
    }
}