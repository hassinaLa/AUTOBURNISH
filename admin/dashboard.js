
const API_BASE_URL = "https://auto-burnish-api.onrender.com";

let token = sessionStorage.getItem("adminToken");
let isLoggedOut = false;
let isLoadingBookings = false;
let bookings = [];

if (!token) {
    window.location.replace("index.html");
    isLoggedOut = true;
}

const tableBody = document.getElementById("bookingsTableBody");
const dashboardMessage = document.getElementById("dashboardMessage");
const statusFilter = document.getElementById("statusFilter");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function logout() {
    if (isLoggedOut) return;

    isLoggedOut = true;
    token = null;

    sessionStorage.removeItem("adminToken");
    window.location.replace("index.html");
}

async function apiRequest(path, options = {}) {
    if (isLoggedOut || !token) {
        throw new Error("Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Your session has expired. Please sign in again.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || "Could not complete the request.");
    }

    return data;
}

function updateStatistics() {
    document.getElementById("totalBookings").textContent = bookings.length;

    for (const status of ["pending", "confirmed", "completed"]) {
        const count = bookings.filter(
            (booking) => booking.status === status
        ).length;

        document.getElementById(`${status}Bookings`).textContent = count;
    }
}

function renderBookings() {
    if (isLoggedOut) return;

    const selectedStatus = statusFilter.value;

    const filteredBookings = bookings.filter((booking) =>
        selectedStatus === "all" || booking.status === selectedStatus
    );

    if (filteredBookings.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="6">No bookings found.</td></tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredBookings.map((booking) => {
        const vehicle = [
            booking.vehicle_type,
            booking.vehicle_model,
            booking.vehicle_year
        ].filter(Boolean).join(" ");

        return `
            <tr>
                <td>#${escapeHTML(booking.id)}</td>
                <td>
                    <strong>${escapeHTML(booking.full_name)}</strong><br>
                    ${escapeHTML(booking.phone)}
                </td>
                <td>${escapeHTML(vehicle)}</td>
                <td>${escapeHTML(booking.preferred_date)}</td>
                <td>
                    <span class="status-badge status-${escapeHTML(booking.status)}">
                        ${escapeHTML(booking.status)}
                    </span>
                </td>
                <td>
                    <button
                        class="details-button"
                        type="button"
                        data-booking-id="${escapeHTML(booking.id)}"
                    >
                        View
                    </button>
                    <button
                        class="delete-button"
                        type="button"
                        data-delete-booking-id="${escapeHTML(booking.id)}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function loadBookings({ silent = false } = {}) {
    if (isLoadingBookings || isLoggedOut) return;

    isLoadingBookings = true;

    if (!silent) {
        dashboardMessage.textContent = "";
    }

    try {
        const result = await apiRequest("/api/bookings/");

        // Ignore results if the session ended while the request was running.
        if (isLoggedOut) return;

        bookings = result;
        updateStatistics();
        renderBookings();
    } catch (error) {
        if (!isLoggedOut && !silent) {
            dashboardMessage.textContent = error.message;
            tableBody.innerHTML = `
                <tr><td colspan="6">Could not load bookings.</td></tr>
            `;
        }
    } finally {
        isLoadingBookings = false;
    }
}

document.getElementById("refreshButton").addEventListener("click", () => {
    loadBookings();
});

document.getElementById("logoutButton").addEventListener("click", logout);

statusFilter.addEventListener("change", renderBookings);

tableBody.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-booking-id]");

    if (deleteButton) {
        const bookingId = deleteButton.dataset.deleteBookingId;

        const booking = bookings.find(
            (item) => String(item.id) === String(bookingId)
        );

        const customerName = booking?.full_name || "this customer";

        const confirmed = window.confirm(
            `Are you sure you want to delete booking #${bookingId} for ${customerName}?\n\nThis action cannot be undone.`
        );

        if (!confirmed || isLoggedOut) return;

        deleteButton.disabled = true;

        try {
            await apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}`, {
                method: "DELETE"
            });

            if (isLoggedOut) return;

            bookings = bookings.filter(
                (item) => String(item.id) !== String(bookingId)
            );

            updateStatistics();
            renderBookings();

            dashboardMessage.textContent =
                `Booking #${bookingId} deleted successfully.`;
        } catch (error) {
            if (!isLoggedOut) {
                dashboardMessage.textContent = error.message;
                deleteButton.disabled = false;
            }
        }

        return;
    }

    const viewButton = event.target.closest("[data-booking-id]");

    if (!viewButton || isLoggedOut) return;

    const bookingId = viewButton.dataset.bookingId;

    window.location.href =
        `booking-details.html?id=${encodeURIComponent(bookingId)}`;
});

// Load bookings when the dashboard opens.
if (!isLoggedOut) {
    loadBookings();
}

// Refresh automatically every 15 seconds while the tab is visible.
setInterval(() => {
    if (!document.hidden && !isLoggedOut) {
        loadBookings({ silent: true });
    }
}, 15000);
