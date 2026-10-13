
const API_BASE_URL = "https://auto-burnish-api.onrender.com";

const token = sessionStorage.getItem("adminToken");
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("id");

const detailsMessage = document.getElementById("detailsMessage");
const bookingInfo = document.getElementById("bookingInfo");
const statusSelect = document.getElementById("statusSelect");
const statusForm = document.getElementById("statusForm");
const saveStatusButton = document.getElementById("saveStatusButton");

let currentBooking = null;

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function showMessage(message, isSuccess = false) {
    detailsMessage.textContent = message;
    detailsMessage.classList.toggle("success", isSuccess);
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

function addInfo(label, value) {
    return `
        <div class="info-item">
            <span class="info-label">${escapeHTML(label)}</span>
            <div class="info-value">${escapeHTML(value || "—")}</div>
        </div>
    `;
}

function renderBooking(booking) {
    document.getElementById("bookingNumber").textContent = `#${booking.id}`;

    const currentStatus = document.getElementById("currentStatus");
    currentStatus.textContent = booking.status;
    currentStatus.className =
        `status-badge status-${String(booking.status).toLowerCase()}`;

    statusSelect.value = booking.status;

    bookingInfo.innerHTML = [
        addInfo("Customer name", booking.full_name),
        addInfo("Phone", booking.phone),
        addInfo("Email", booking.email),
        addInfo("Vehicle type", booking.vehicle_type),
        addInfo("Vehicle model", booking.vehicle_model),
        addInfo("Vehicle year", booking.vehicle_year),
        addInfo("Vehicle color", booking.vehicle_color),
        addInfo("Package", booking.package),
        addInfo("Service", booking.service),
        addInfo("Request type", booking.request_type),
        addInfo("Preferred date", booking.preferred_date),
        addInfo("Preferred time", booking.preferred_time),
        addInfo("Contact preference", booking.contact_preference),
        addInfo("Created at", booking.created_at
            ? new Date(booking.created_at).toLocaleString()
            : "—"),
        addInfo("Customer message", booking.message)
    ].join("");
}

async function loadBooking() {
    const booking = await apiRequest(`/api/bookings/${bookingId}`);
    currentBooking = booking;
    renderBooking(booking);
}

statusForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentBooking) return;

    saveStatusButton.disabled = true;
    saveStatusButton.textContent = "Saving...";

    try {
        const updated = await apiRequest(
            `/api/bookings/${bookingId}/status`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: statusSelect.value })
            }
        );

        currentBooking = updated;
        renderBooking(updated);
        showMessage("Booking status updated successfully.", true);
    } catch (error) {
        showMessage(error.message);
    } finally {
        saveStatusButton.disabled = false;
        saveStatusButton.textContent = "Save status";
    }
});

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.replace("index.html");
});

if (!token) {
    window.location.replace("index.html");
} else if (!bookingId || !/^\d+$/.test(bookingId)) {
    showMessage("Invalid booking ID.");
    bookingInfo.innerHTML = "<p>Please return to the bookings list.</p>";
} else {
    loadBooking().catch((error) => {
        showMessage(error.message);
    });
}