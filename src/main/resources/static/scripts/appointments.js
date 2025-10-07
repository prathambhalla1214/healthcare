let allAppointments = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    loadPatientsForDropdown();
    loadDoctorsForDropdown();
    setupFormSubmit();
    setMinDate();
});

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

async function loadAppointments() {
    try {
        allAppointments = await fetchAPI(API_ENDPOINTS.appointments);
        displayAppointments(allAppointments);
    } catch (error) {
        showToast('Error loading appointments: ' + error.message, 'error');
        document.getElementById('appointmentsList').innerHTML =
            '<div class="loading-spinner">Error loading appointments</div>';
    }
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsList');

    if (appointments.length === 0) {
        container.innerHTML = '<div class="loading-spinner">No appointments found</div>';
        return;
    }

    container.innerHTML = appointments.map(appt => `
    <div class="appointment-card ${appt.status.toLowerCase()}">
      <div class="appointment-header">
        <div class="appointment-info">
          <h4>${appt.patientName}</h4>
          <p>Dr. ${appt.doctorName} - ${appt.doctorSpecialization}</p>
        </div>
        ${getStatusBadge(appt.status)}
      </div>
      
      <div class="appointment-meta">
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>${formatDateTime(appt.appointmentDateTime)}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-dollar-sign"></i>
          <span>Fee: $${appt.consultationFee || 0}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-envelope"></i>
          <span>${appt.patientEmail}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-phone"></i>
          <span>${appt.patientPhone}</span>
        </div>
      </div>
      
      ${appt.symptoms ? `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
          <strong>Symptoms:</strong> ${appt.symptoms}
        </div>
      ` : ''}
      
      <div class="appointment-actions">
        <button class="btn btn-sm btn-primary" onclick="viewDetails(${appt.id})">
          <i class="fas fa-eye"></i> View Details
        </button>
        ${appt.status === 'SCHEDULED' ? `
          <button class="btn btn-sm btn-success" onclick="updateStatus(${appt.id}, 'CONFIRMED')">
            <i class="fas fa-check"></i> Confirm
          </button>
          <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appt.id})">
            <i class="fas fa-times"></i> Cancel
          </button>
        ` : ''}
        ${appt.status === 'CONFIRMED' ? `
          <button class="btn btn-sm btn-success" onclick="updateStatus(${appt.id}, 'COMPLETED')">
            <i class="fas fa-check-circle"></i> Complete
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function filterAppointments() {
    const status = document.getElementById('statusFilter').value;

    if (!status) {
        displayAppointments(allAppointments);
        return;
    }

    const filtered = allAppointments.filter(appt => appt.status === status);
    displayAppointments(filtered);
}

async function loadPatientsForDropdown() {
    try {
        const patients = await fetchAPI(API_ENDPOINTS.patients);
        const select = document.getElementById('patientId');
        select.innerHTML = '<option value="">Select Patient</option>' +
            patients.map(p => `<option value="${p.id}">${p.name} - ${p.email}</option>`).join('');
    } catch (error) {
        showToast('Error loading patients', 'error');
    }
}

async function loadDoctorsForDropdown() {
    try {
        const doctors = await fetchAPI(`${API_ENDPOINTS.doctors}/available`);
        const select = document.getElementById('doctorId');
        select.innerHTML = '<option value="">Select Doctor</option>' +
            doctors.map(d => `<option value="${d.id}">Dr. ${d.name} - ${d.specialization}</option>`).join('');
    } catch (error) {
        showToast('Error loading doctors', 'error');
    }
}

function setupFormSubmit() {
    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const dateTime = `${date}T${time}:00`;

        const appointmentData = {
            patientId: parseInt(document.getElementById('patientId').value),
            doctorId: parseInt(document.getElementById('doctorId').value),
            appointmentDateTime: dateTime,
            symptoms: document.getElementById('symptoms').value || null
        };

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

        try {
            await fetchAPI(API_ENDPOINTS.appointments, {
                method: 'POST',
                body: JSON.stringify(appointmentData)
            });

            showToast('Appointment booked successfully!', 'success');
            closeModal('appointmentModal');
            form.reset();
            loadAppointments();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Appointment';
        }
    });
}

async function viewDetails(id) {
    try {
        const appt = await fetchAPI(`${API_ENDPOINTS.appointments}/${id}`);

        const detailsHTML = `
      <div style="padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
          <div>
            <strong>Appointment ID:</strong><br>${appt.id}
          </div>
          <div>
            <strong>Status:</strong><br>${getStatusBadge(appt.status)}
          </div>
        </div>
        
        <div style="margin: 1rem 0; padding: 1rem; background: var(--background); border-radius: 0.5rem;">
          <h3 style="margin-bottom: 0.5rem;">Patient Information</h3>
          <p><strong>Name:</strong> ${appt.patientName}</p>
          <p><strong>Email:</strong> ${appt.patientEmail}</p>
          <p><strong>Phone:</strong> ${appt.patientPhone}</p>
        </div>
        
        <div style="margin: 1rem 0; padding: 1rem; background: var(--background); border-radius: 0.5rem;">
          <h3 style="margin-bottom: 0.5rem;">Doctor Information</h3>
          <p><strong>Name:</strong> Dr. ${appt.doctorName}</p>
          <p><strong>Specialization:</strong> ${appt.doctorSpecialization}</p>
          <p><strong>Consultation Fee:</strong> $${appt.consultationFee || 0}</p>
        </div>
        
        <div style="margin: 1rem 0; padding: 1rem; background: var(--background); border-radius: 0.5rem;">
          <h3 style="margin-bottom: 0.5rem;">Appointment Details</h3>
          <p><strong>Date & Time:</strong> ${formatDateTime(appt.appointmentDateTime)}</p>
          <p><strong>Symptoms:</strong> ${appt.symptoms || 'Not provided'}</p>
          ${appt.diagnosis ? `<p><strong>Diagnosis:</strong> ${appt.diagnosis}</p>` : ''}
          ${appt.prescription ? `<p><strong>Prescription:</strong> ${appt.prescription}</p>` : ''}
          ${appt.notes ? `<p><strong>Notes:</strong> ${appt.notes}</p>` : ''}
        </div>
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.875rem; color: var(--text-secondary);">
          <p><strong>Created:</strong> ${formatDateTime(appt.createdAt)}</p>
          ${appt.updatedAt ? `<p><strong>Updated:</strong> ${formatDateTime(appt.updatedAt)}</p>` : ''}
        </div>
      </div>
    `;

        document.getElementById('appointmentDetails').innerHTML = detailsHTML;
        openModal('detailsModal');
    } catch (error) {
        showToast('Error loading appointment details: ' + error.message, 'error');
    }
}

async function updateStatus(id, status) {
    try {
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        showToast('Appointment status updated!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error updating status: ' + error.message, 'error');
    }
}

async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}/cancel`, {
            method: 'PATCH'
        });

        showToast('Appointment cancelled successfully!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error cancelling appointment: ' + error.message, 'error');
    }
}