// utils.js (IMPROVED)

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const statusMap = {
        'SCHEDULED': 'info',
        'CONFIRMED': 'info',
        'COMPLETED': 'success',
        'CANCELLED': 'danger',
        'NO_SHOW': 'warning'
    };
    const badgeClass = statusMap[status] || 'info';
    return `<span class="badge badge-${badgeClass}">${status}</span>`;
}

function validatePhone(phone) {
    const phoneRegex = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?([-. (]*(\d{3})[-. )]*)?([-. ]*(\d{4}))\s*$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * IMPROVED: fetchAPI conditionally sets 'Content-Type: application/json'.
 * This fixes issues with Spring endpoints using @RequestParam (query params)
 * which do not expect a JSON body and fail if the content-type header is present.
 */
async function fetchAPI(url, options = {}) {
    const requestOptions = {
        ...options,
        headers: {
            ...options.headers
        }
    };

    // Only set 'Content-Type: application/json' if a body is present 
    if (requestOptions.body && !requestOptions.headers['Content-Type'] && !requestOptions.headers['content-type']) {
        requestOptions.headers['Content-Type'] = 'application/json';
    } else if (!requestOptions.body) {
        // Explicitly remove content-type for methods like GET/DELETE/PUT with query params
        delete requestOptions.headers['Content-Type'];
        delete requestOptions.headers['content-type'];
    }

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorData = {};
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json().catch(() => ({}));
            } else {
                errorData.message = await response.text().catch(() => `HTTP error! status: ${response.status}`);
            }

            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Handle 204 No Content (like for DELETE or some PUTs)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}