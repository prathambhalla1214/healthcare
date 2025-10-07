// appointments.js (IMPROVED)
let allAppointments = [];
let editingAppointmentId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
    loadPatientsForDropdown();
    loadDoctorsForDropdown();
    setupFormSubmit();
    setMinDate();
    setupConsultationFormSubmit(); // Added handler for new modal
});

// ... (setMinDate, loadAppointments, loadPatientsForDropdown, loadDoctorsForDropdown functions remain the same)

function formatDateTimeForAPI(date, time) {
    // Controller expects ISO format: YYYY-MM-DDTHH:mm:ss
    return `${date}T${time}:00`;
}

function setupFormSubmit() {
    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const patientId = document.getElementById('patientId').value;
        const doctorId = document.getElementById('doctorId').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const symptoms = document.getElementById('symptoms').value;
        const submitBtn = document.getElementById('submitBtn');

        const appointmentDateTime = formatDateTimeForAPI(date, time);

        // FIX: MATCHES CONTROLLER POST endpoint using @RequestParam
        const params = new URLSearchParams({ patientId, doctorId, appointmentDateTime, symptoms });
        const url = `${API_ENDPOINTS.appointments}?${params.toString()}`;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

            await fetchAPI(url, {
                method: 'POST',
                // Data is passed in the URL, no JSON body sent.
            });

            showToast('Appointment booked successfully!', 'success');
            form.reset();
            closeModal('appointmentModal');
            loadAppointments();
        } catch (error) {
            showToast('Error booking appointment: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Appointment';
        }
    });
}

// FIX: Changed method from PATCH to PUT and uses query parameter
async function updateStatus(id, status) {
    try {
        // MATCHES CONTROLLER: PUT /api/appointments/{id}/status?status={status}
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}/status?status=${status}`, {
            method: 'PUT'
            // Note: status is an Enum string, passed as a URL parameter
        });
        showToast('Appointment status updated!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error updating status: ' + error.message, 'error');
    }
}

// FIX: Changed method from PATCH to PUT
async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    try {
        // MATCHES CONTROLLER: PUT /api/appointments/{id}/cancel
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}/cancel`, {
            method: 'PUT'
        });
        showToast('Appointment cancelled successfully!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error cancelling appointment: ' + error.message, 'error');
    }
}

// NEW FUNCTION: Handles Rescheduling
async function rescheduleAppointment(id) {
    const newDateTimeInput = prompt("Enter new date and time (YYYY-MM-DD HH:mm):");
    if (!newDateTimeInput) return;

    try {
        const [date, time] = newDateTimeInput.split(' ');
        if (!date || !time) throw new Error("Invalid date/time format. Use YYYY-MM-DD HH:mm.");

        const newDateTime = formatDateTimeForAPI(date, time);

        // MATCHES CONTROLLER: PUT /api/appointments/{id}/reschedule?newDateTime={newDateTime}
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}/reschedule?newDateTime=${newDateTime}`, {
            method: 'PUT'
        });
        showToast('Appointment rescheduled successfully!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error rescheduling: ' + error.message, 'error');
    }
}

// NEW FUNCTION: Consultation Details Update (Diagnosis/Prescription/Notes)
function openConsultationModal(id) {
    editingAppointmentId = id;
    const appt = allAppointments.find(a => a.id === id);
    if (!appt) return;

    // Prefill form if data exists
    document.getElementById('diagnosis').value = appt.diagnosis || '';
    document.getElementById('prescription').value = appt.prescription || '';
    document.getElementById('notes').value = appt.notes || '';
    document.getElementById('consultationModalTitle').textContent = `Update Consultation for Appointment #${id}`;
    openModal('consultationModal');
}

function setupConsultationFormSubmit() {
    const form = document.getElementById('consultationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const diagnosis = document.getElementById('diagnosis').value;
        const prescription = document.getElementById('prescription').value;
        const notes = document.getElementById('notes').value;
        const id = editingAppointmentId;

        if (!id) return showToast('Error: No appointment selected.', 'error');

        // MATCHES CONTROLLER: PUT /api/appointments/{id}/details uses @RequestParam
        const params = new URLSearchParams({ diagnosis, prescription, notes });
        const url = `${API_ENDPOINTS.appointments}/${id}/details?${params.toString()}`;

        try {
            await fetchAPI(url, {
                method: 'PUT',
            });
            showToast('Consultation details updated!', 'success');
            closeModal('consultationModal');
            loadAppointments();
        } catch (error) {
            showToast('Error updating details: ' + error.message, 'error');
        }
    });
}

// FIX: Handles Delete
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) {
        return;
    }
    try {
        // MATCHES CONTROLLER: @DeleteMapping("/{id}")
        await fetchAPI(`${API_ENDPOINTS.appointments}/${id}`, {
            method: 'DELETE'
        });
        showToast('Appointment deleted successfully!', 'success');
        loadAppointments();
    } catch (error) {
        showToast('Error deleting appointment: ' + error.message, 'error');
    }
}

// IMPORTANT: Updated displayAppointments to include new action buttons
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
          <i class="fas fa-calendar-alt"></i>
          <span>${formatDateTime(appt.appointmentDateTime)}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-info-circle"></i>
          <span title="${appt.symptoms}">${appt.symptoms.substring(0, 50)}${appt.symptoms.length > 50 ? '...' : ''}</span>
        </div>
      </div>

      <div class="appointment-actions">
        <button class="btn btn-sm btn-info" onclick="loadAppointmentDetails(${appt.id})">
            <i class="fas fa-eye"></i> Details
        </button>
        ${appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED' ? `
          <button class="btn btn-sm btn-secondary" onclick="rescheduleAppointment(${appt.id})">
              <i class="fas fa-redo-alt"></i> Reschedule
          </button>
          <button class="btn btn-sm btn-danger" onclick="cancelAppointment(${appt.id})">
              <i class="fas fa-times"></i> Cancel
          </button>
        ` : ''}
        ${appt.status === 'COMPLETED' ? `
          <button class="btn btn-sm btn-primary" onclick="openConsultationModal(${appt.id})">
              <i class="fas fa-clipboard-check"></i> Consultation
          </button>
        ` : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appt.id})" style="margin-left: auto;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// ... (loadAppointmentDetails and other helper functions remain the same)