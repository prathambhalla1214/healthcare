package com.example.healthcare.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Entity
@Table(name = "patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false)
    private Long id;

    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Email
    @Size(max = 50)
    @Column(name = "email", nullable = false, unique = true, length = 50)
    private String email;

    @NotNull
    @Pattern(regexp = "\\d{10,15}")
    @Column(name = "phone_number", nullable = false, unique = true)
    private String phoneNumber;

    @NotNull
    @Column(name="date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Transient
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name="gender", length = 20)
    private Gender gender;

    @NotNull
    @Size(max = 500)
    @Column(name="address", nullable = false, length = 500)
    private String address;

    @NotNull
    @Size(max = 50)
    @Column(name="city", nullable = false, length = 50)
    private String city;

    @Size(max = 50)
    @Column(name="state", length = 50)
    private String state;

    @NotNull
    @Size(max = 50)
    @Column(name="country", nullable = false, length = 50)
    private String country;

    @NotNull
    @Size(max = 50)
    @Column(name="pin_code", nullable = false, length = 50)
    private String pinCode;

    @Size(max = 1000)
    @Column(name="medical_history", length = 1000)
    private String medicalHistory;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
