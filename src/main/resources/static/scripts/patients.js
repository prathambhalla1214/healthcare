let allPatients = [];
let editingPatientId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadPatients();
    setupFormSubmit();
    setupSearch();
});

async function loadPatients() {
    try {
        allPatients = await fetchAPI(API_ENDPOINTS.patients);
        displayPatients(allPatients);
    } catch (error) {
        showToast('Error loading patients: ' + error.message, 'error');
        document.getElementById('patientTableBody').innerHTML =
            '<tr><td colspan="7" class="text-center">Error loading patients</td></tr>';
    }
}

function displayPatients(patients) {
    const tbody = document.getElementById('patientTableBody');

    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No patients found</td></tr>';
        return;
    }

    tbody.innerHTML = patients.map(patient => `
    <tr>
      <td>${patient.id}</td>
      <td>${patient.name}</td>
      <td>${patient.email}</td>
      <td>${patient.phone}</td>
      <td>${patient.gender || 'N/A'}</td>
      <td>${formatDate(patient.dateOfBirth)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editPatient(${patient.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deletePatient(${patient.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('searchPatient');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm) ||
            patient.phone.includes(searchTerm)
        );
        displayPatients(filtered);
    });
}

function setupFormSubmit() {
    const form = document.getElementById('patientForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const patientData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dateOfBirth: document.getElementById('dob').value || null,
            gender: document.getElementById('gender').value || null,
            address: document.getElementById('address').value || null,
            medicalHistory: document.getElementById('medicalHistory').value || null
        };

        if (!validatePhone(patientData.phone)) {
            showToast('Please enter a valid phone number', 'error');
            return;
        }

        if (!validateEmail(patientData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            if (editingPatientId) {
                await fetchAPI(`${API_ENDPOINTS.patients}/${editingPatientId}`, {
                    method: 'PUT',
                    body: JSON.stringify(patientData)
                });
                showToast('Patient updated successfully!', 'success');
            } else {
                await fetchAPI(API_ENDPOINTS.patients, {
                    method: 'POST',
                    body: JSON.stringify(patientData)
                });
                showToast('Patient registered successfully!', 'success');
            }

            closeModal('patientModal');
            form.reset();
            editingPatientId = null;
            loadPatients();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Patient';
        }
    });
}

async function editPatient(id) {
    try {
        const patient = await fetchAPI(`${API_ENDPOINTS.patients}/${id}`);

        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('name').value = patient.name;
        document.getElementById('email').value = patient.email;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('dob').value = patient.dateOfBirth || '';
        document.getElementById('gender').value = patient.gender || '';
        document.getElementById('address').value = patient.address || '';
        document.getElementById('medicalHistory').value = patient.medicalHistory || '';

        editingPatientId = id;
        openModal('patientModal');
    } catch (error) {
        showToast('Error loading patient data: ' + error.message, 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) {
        return;
    }

    try {
        await fetchAPI(`${API_ENDPOINTS.patients}/${id}`, {
            method: 'DELETE'
        });
        showToast('Patient deleted successfully!', 'success');
        loadPatients();
    } catch (error) {
        showToast('Error deleting patient: ' + error.message, 'error');
    }
}