let allDoctors = [];
let editingDoctorId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    setupFormSubmit();
});

async function loadDoctors() {
    try {
        allDoctors = await fetchAPI(API_ENDPOINTS.doctors);
        displayDoctors(allDoctors);
    } catch (error) {
        showToast('Error loading doctors: ' + error.message, 'error');
        document.getElementById('doctorsGrid').innerHTML =
            '<div class="loading-spinner">Error loading doctors</div>';
    }
}

function displayDoctors(doctors) {
    const grid = document.getElementById('doctorsGrid');

    if (doctors.length === 0) {
        grid.innerHTML = '<div class="loading-spinner">No doctors found</div>';
        return;
    }

    grid.innerHTML = doctors.map(doctor => `
    <div class="doctor-card">
      <div class="doctor-header">
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <p>${doctor.specialization}</p>
        </div>
        <div class="doctor-rating">
          <i class="fas fa-star"></i>
          <span>${doctor.averageRating || 0}</span>
        </div>
      </div>
      
      <div class="doctor-details">
        <div class="detail-item">
          <i class="fas fa-envelope"></i>
          <span>${doctor.email}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-phone"></i>
          <span>${doctor.phone}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-graduation-cap"></i>
          <span>${doctor.qualification || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-briefcase"></i>
          <span>${doctor.experienceYears || 0} years experience</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-dollar-sign"></i>
          <span>${doctor.consultationFee || 0} consultation fee</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-calendar-check"></i>
          <span>${doctor.totalAppointments || 0} appointments</span>
        </div>
      </div>
      
      <div class="doctor-actions">
        <button class="btn btn-sm btn-primary" onclick="editDoctor(${doctor.id})" style="flex: 1">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm ${doctor.available ? 'btn-success' : 'btn-secondary'}" 
                onclick="toggleAvailability(${doctor.id})" style="flex: 1">
          <i class="fas fa-power-off"></i> ${doctor.available ? 'Available' : 'Unavailable'}
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteDoctor(${doctor.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function filterDoctors() {
    const specialization = document.getElementById('specializationFilter').value;
    const availableOnly = document.getElementById('availableFilter').checked;

    let filtered = allDoctors;

    if (specialization) {
        filtered = filtered.filter(d => d.specialization === specialization);
    }

    if (availableOnly) {
        filtered = filtered.filter(d => d.available);
    }

    displayDoctors(filtered);
}

function setupFormSubmit() {
    const form = document.getElementById('doctorForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doctorData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            specialization: document.getElementById('specialization').value,
            qualification: document.getElementById('qualification').value || null,
            experienceYears: parseInt(document.getElementById('experienceYears').value) || null,
            consultationFee: parseFloat(document.getElementById('consultationFee').value) || null,
            address: document.getElementById('address').value || null,
            available: document.getElementById('available').value === 'true'
        };

        if (!validatePhone(doctorData.phone)) {
            showToast('Please enter a valid phone number', 'error');
            return;
        }

        if (!validateEmail(doctorData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            if (editingDoctorId) {
                await fetchAPI(`${API_ENDPOINTS.doctors}/${editingDoctorId}`, {
                    method: 'PUT',
                    body: JSON.stringify(doctorData)
                });
                showToast('Doctor updated successfully!', 'success');
            } else {
                await fetchAPI(API_ENDPOINTS.doctors, {
                    method: 'POST',
                    body: JSON.stringify(doctorData)
                });
                showToast('Doctor added successfully!', 'success');
            }

            closeModal('doctorModal');
            form.reset();
            editingDoctorId = null;
            loadDoctors();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Doctor';
        }
    });
}

async function editDoctor(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.doctors}/${id}`);
        const doctor = await response.json();

        document.getElementById('modalTitle').textContent = 'Edit Doctor';
        document.getElementById('name').value = doctor.name;
        document.getElementById('email').value = doctor.email;
        document.getElementById('phone').value = doctor.phone;
        document.getElementById('specialization').value = doctor.specialization;
        document.getElementById('qualification').value = doctor.qualification || '';
        document.getElementById('experienceYears').value = doctor.experienceYears || '';
        document.getElementById('consultationFee').value = doctor.consultationFee || '';
        document.getElementById('address').value = doctor.address || '';
        document.getElementById('available').value = doctor.available ? 'true' : 'false';

        editingDoctorId = id;
        openModal('doctorModal');
    } catch (error) {
        showToast('Error loading doctor data: ' + error.message, 'error');
    }
}

async function toggleAvailability(id) {
    try {
        await fetchAPI(`${API_ENDPOINTS.doctors}/${id}/toggle-availability`, {
            method: 'PATCH'
        });
        showToast('Doctor availability updated!', 'success');
        loadDoctors();
    } catch (error) {
        showToast('Error updating availability: ' + error.message, 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) {
        return;
    }

    try {
        await fetchAPI(`${API_ENDPOINTS.doctors}/${id}`, {
            method: 'DELETE'
        });
        showToast('Doctor deleted successfully!', 'success');
        loadDoctors();
    } catch (error) {
        showToast('Error deleting doctor: ' + error.message, 'error');
    }
}