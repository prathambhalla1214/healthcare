// review.js (NEW FILE)
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadAppointmentsForReview();
    setupReviewFormSubmit();
});

// Helper to load completed appointments for review
async function loadAppointmentsForReview() {
    const select = document.getElementById('appointmentId');
    select.innerHTML = '<option value="">Select an Appointment</option>';
    try {
        const appointments = await fetchAPI(API_ENDPOINTS.appointments);

        appointments.filter(appt => appt.status === 'COMPLETED').forEach(appt => {
            select.innerHTML += `<option value="${appt.id}">#${appt.id} - Dr. ${appt.doctorName} - ${formatDateTime(appt.appointmentDateTime)}</option>`;
        });
    } catch (error) {
        select.innerHTML = '<option value="">Error loading appointments</option>';
        showToast('Error loading appointments: ' + error.message, 'error');
    }
}

// Function to handle star click logic
function setRating(rating) {
    currentRating = rating;
    document.getElementById('rating').value = rating;
    document.querySelectorAll('.rating-star').forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        star.classList.remove('far', 'fas');
        star.classList.add(starRating <= rating ? 'fas' : 'far');
    });
}
// This line makes setRating available globally for the HTML onclick
window.setRating = setRating;

function setupReviewFormSubmit() {
    const form = document.getElementById('reviewForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const appointmentId = document.getElementById('appointmentId').value;
        const rating = document.getElementById('rating').value;
        const comment = document.getElementById('comment').value;
        const submitBtn = document.getElementById('submitBtn');

        if (!appointmentId || !rating) {
            return showToast('Please select an appointment and a rating.', 'error');
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            // ASSUMPTION: POST /api/reviews uses @RequestBody (JSON)
            await fetchAPI(API_ENDPOINTS.reviews, {
                method: 'POST',
                body: JSON.stringify({ appointmentId: parseInt(appointmentId), rating: parseInt(rating), comment })
            });

            showToast('Review submitted successfully!', 'success');
            form.reset();
            setRating(0); // Reset stars
        } catch (error) {
            showToast('Error submitting review: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Submit Review';
        }
    });
}