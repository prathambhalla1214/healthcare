document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_ENDPOINTS.dashboard}/stats`);
        const stats = await response.json();

        document.getElementById('totalDoctors').textContent = stats.totalDoctors || 0;
        document.getElementById('availableDoctors').textContent = `${stats.availableDoctors || 0} Available`;
        document.getElementById('totalPatients').textContent = stats.totalPatients || 0;
        document.getElementById('totalAppointments').textContent = stats.totalAppointments || 0;
        document.getElementById('scheduledAppointments').textContent = `${stats.scheduledAppointments || 0} Scheduled`;
        document.getElementById('totalReviews').textContent = stats.totalReviews || 0;

        document.getElementById('scheduledCount').textContent = stats.scheduledAppointments || 0;
        document.getElementById('completedCount').textContent = stats.completedAppointments || 0;
        document.getElementById('cancelledCount').textContent = stats.cancelledAppointments || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showErrorState();
    }
}

function showErrorState() {
    document.querySelectorAll('.stat-content h3').forEach(el => {
        el.textContent = 'Error';
    });
}