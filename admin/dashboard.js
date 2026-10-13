
const API_BASE_URL = "https://auto-burnish-api.onrender.com";

const token = sessionStorage.getItem("adminToken");

if (!token) {
    window.location.replace("index.html");
}

const tableBody = document.getElementById("bookingsTableBody");
const dashboardMessage = document.getElementById("dashboardMessage");
const statusFilter = document.getElementById("statusFilter");

let bookings = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });

    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        window.location.replace("index.html");
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


let isLoadingBookings = false;

async function loadBookings({ silent = false } = {}) {
    if (isLoadingBookings) return;

    isLoadingBookings = true;

    if (!silent) {
        dashboardMessage.textContent = "";
    }

    try {
        bookings = await apiRequest("/api/bookings/");
        updateStatistics();
        renderBookings();
    } catch (error) {
        // Avoid replacing the dashboard during a temporary
        // background-refresh failure.
        if (!silent) {
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

// Load bookings when the dashboard opens.
loadBookings();

// Refresh automatically every 15 seconds while the tab is visible.
setInterval(() => {
    if (!document.hidden) {
        loadBookings({ silent: true });
    }
}, 15000);


statusFilter.addEventListener("change", renderBookings);

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("index.html");
});


tableBody.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(
        "[data-delete-booking-id]"
    );

    if (deleteButton) {
        const bookingId = deleteButton.dataset.deleteBookingId;

        const booking = bookings.find(
            (item) => String(item.id) === String(bookingId)
        );

        const customerName = booking?.full_name || "this customer";

        const confirmed = window.confirm(
            `Are you sure you want to delete booking #${bookingId} for ${customerName}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        deleteButton.disabled = true;

        try {
            await apiRequest(`/api/bookings/${bookingId}`, {
                method: "DELETE"
            });

            bookings = bookings.filter(
                (item) => String(item.id) !== String(bookingId)
            );

            updateStatistics();
            renderBookings();

            dashboardMessage.textContent =
                `Booking #${bookingId} deleted successfully.`;
        } catch (error) {
            dashboardMessage.textContent = error.message;
            deleteButton.disabled = false;
        }

        return;
    }

    const viewButton = event.target.closest(
        "[data-booking-id]"
    );

    if (!viewButton) return;

    const bookingId = viewButton.dataset.bookingId;

    window.location.href =
        `booking-details.html?id=${encodeURIComponent(bookingId)}`;
});
