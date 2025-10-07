// doctors.js (IMPROVED)
let allDoctors = [];
let editingDoctorId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    setupFormSubmit();
    setupFilters(); // New function call
    loadSpecializationsForFilter(); // New function call
});

// FIX: Change method from PATCH to PUT
async function toggleAvailability(id) {
    try {
        // MATCHES CONTROLLER: @PutMapping("/{id}/toggle-availability")
        await fetchAPI(`${API_ENDPOINTS.doctors}/${id}/toggle-availability`, {
            method: 'PUT'
        });
        showToast('Doctor availability updated!', 'success');
        loadDoctors();
    } catch (error) {
        showToast('Error updating availability: ' + error.message, 'error');
    }
}

// NEW FUNCTION: Loads unique specializations for filter dropdown
async function loadSpecializationsForFilter() {
    try {
        const doctors = await fetchAPI(API_ENDPOINTS.doctors);
        // Extract unique specializations
        const specializations = [...new Set(doctors.map(d => d.specialization))].filter(Boolean);

        const select = document.getElementById('filterSpecialization');
        select.innerHTML = '<option value="">All Specializations</option>' + specializations.map(spec =>
            `<option value="${spec}">${spec}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading specializations:', error);
    }
}

// NEW FUNCTION: Implements the filtering logic
function setupFilters() {
    const specializationInput = document.getElementById('filterSpecialization');
    const availabilityInput = document.getElementById('filterAvailability');
    const searchButton = document.getElementById('applyFilterBtn');
    const resetSearch = document.getElementById('resetFilterBtn');

    const filterDoctors = async () => {
        const specialization = specializationInput.value;
        const available = availabilityInput.value;

        let url = API_ENDPOINTS.doctors;

        // Logic based on DoctorController endpoints:
        if (available === 'available' && specialization) {
            // GET /api/doctors/available/specialization?specialization=
            url = `${API_ENDPOINTS.doctors}/available/specialization?specialization=${encodeURIComponent(specialization)}`;
        } else if (available === 'available') {
            // GET /api/doctors/available
            url = `${API_ENDPOINTS.doctors}/available`;
        } else if (specialization) {
            // GET /api/doctors/specialization?specialization=
            url = `${API_ENDPOINTS.doctors}/specialization?specialization=${encodeURIComponent(specialization)}`;
        } else {
            // Load all if no filter is applied
            url = API_ENDPOINTS.doctors;
        }

        try {
            allDoctors = await fetchAPI(url);
            displayDoctors(allDoctors);
            showToast('Doctors filtered successfully!', 'success');
        } catch (error) {
            showToast('Error filtering doctors: ' + error.message, 'error');
            document.getElementById('doctorsGrid').innerHTML =
                '<div class="loading-spinner">No doctors found matching criteria.</div>';
        }
    };

    searchButton.addEventListener('click', filterDoctors);
    resetFilterBtn.addEventListener('click', () => {
        specializationInput.value = '';
        availabilityInput.value = '';
        loadDoctors();
    });
}

// ... (loadDoctors, displayDoctors, setupFormSubmit, editDoctor, deleteDoctor remain the same, but ensure updateDoctor uses PUT)

async function setupFormSubmit() {
    const form = document.getElementById('doctorForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (data extraction remains the same)
        const doctorData = {
            // ... (extracted data)
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            specialization: document.getElementById('specialization').value,
            qualification: document.getElementById('qualification').value,
            experienceYears: parseInt(document.getElementById('experienceYears').value),
            consultationFee: parseFloat(document.getElementById('consultationFee').value),
            address: document.getElementById('address').value,
            available: document.getElementById('available').value === 'true' // Convert to boolean
        };

        const method = editingDoctorId ? 'PUT' : 'POST';
        const url = editingDoctorId ? `${API_ENDPOINTS.doctors}/${editingDoctorId}` : API_ENDPOINTS.doctors;

        try {
            // ... (loading state)

            await fetchAPI(url, {
                method: method,
                body: JSON.stringify(doctorData) // Uses @RequestBody, so JSON body is correct
            });

            // ... (success state)
            showToast(`Doctor ${editingDoctorId ? 'updated' : 'created'} successfully!`, 'success');
            form.reset();
            closeModal('doctorModal');
            editingDoctorId = null;
            loadDoctors();
        } catch (error) {
            // ... (error state)
            showToast('Error: ' + error.message, 'error');
        } finally {
            // ... (reset loading state)
        }
    });
}