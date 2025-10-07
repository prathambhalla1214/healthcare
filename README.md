# Healthcare Appointment Booking System - Backend

A comprehensive Spring Boot REST API for managing doctor appointments, patient records, medical records, and reviews.

## Features

- **Doctor Management**: CRUD operations, availability tracking, specialization filtering
- **Patient Management**: Patient registration and profile management
- **Appointment System**: Book, reschedule, cancel appointments with conflict detection
- **Medical Records**: Detailed patient health records linked to appointments
- **Review System**: Patient reviews and ratings for doctors
- **Dashboard Analytics**: Statistics for doctors, patients, and appointments
- **Exception Handling**: Global exception handler with custom exceptions
- **DTO Pattern**: Separate data transfer objects for API responses
- **Validation**: Input validation using Jakarta Bean Validation

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL Database
- Lombok
- Maven

## Project Structure

```
com.example.healthcare/
├── controller/          # REST controllers
├── service/            # Business logic layer
├── repository/         # Data access layer
├── model/              # Entity models
├── dto/                # Data Transfer Objects
└── exception/          # Custom exceptions and handlers
```

## Database Entities

### Doctor
- Personal information (name, email, phone)
- Professional details (specialization, qualification, experience)
- Consultation fee
- Availability status
- Relationships: appointments, availability schedule, reviews

### Patient
- Personal information (name, email, phone, DOB)
- Gender and address
- Medical history
- Relationships: appointments, reviews, medical records

### Appointment
- Patient and doctor references
-