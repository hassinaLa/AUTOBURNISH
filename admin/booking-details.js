
const API_BASE_URL = "http://127.0.0.1:8000";

const token = sessionStorage.getItem("adminToken");
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("id");

const detailsMessage = document.getElementById("detailsMessage");
const bookingInfo = document.getElementById("bookingInfo");
const photosGallery = document.getElementById("photosGallery");
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

async function loadPhotos() {
    photosGallery.innerHTML = "<p>Loading photos...</p>";

    try {
        const data = await apiRequest(`/api/bookings/${bookingId}/photos`);

        if (!data.photos || data.photos.length === 0) {
            photosGallery.innerHTML = "<p>No photos have been uploaded for this booking.</p>";
            return;
        }

        photosGallery.innerHTML = data.photos.map((photo) => {
            const viewPath =
                `/api/bookings/${bookingId}/photos/${photo.id}/view`;

            return `
                <article class="photo-card">
                    <img
                        class="photo-preview"
                        data-photo-id="${escapeHTML(photo.id)}"
                        src=""
                        alt="Vehicle photo for booking ${escapeHTML(bookingId)}"
                        loading="lazy"
                    >
                    <p class="photo-caption">
                        ${escapeHTML(photo.filename)}
                    </p>
                    <button
                        class="photo-open-button"
                        type="button"
                        data-open-photo="${escapeHTML(photo.id)}"
                    >
                        View full image
                    </button>
                </article>
            `;
        }).join("");

        // Fetch protected images with the admin token.
        const imageElements = photosGallery.querySelectorAll("[data-photo-id]");

        await Promise.all([...imageElements].map(async (image) => {
            const photoId = image.dataset.photoId;
            const path =
                `/api/bookings/${bookingId}/photos/${photoId}/view`;

            try {
                const response = await fetch(`${API_BASE_URL}${path}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Unable to load this image.");
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                image.src = objectUrl;
                image.dataset.objectUrl = objectUrl;
            } catch {
                image.alt = "Image could not be loaded";
                image.insertAdjacentHTML(
                    "afterend",
                    '<p class="photo-caption">Could not load image.</p>'
                );
            }
        }));
    } catch (error) {
        photosGallery.innerHTML = "<p>Could not load photos.</p>";
        showMessage(error.message);
    }
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

photosGallery.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-photo]");
    const image = event.target.closest("[data-photo-id]");
    const photoId = button?.dataset.openPhoto || image?.dataset.photoId;

    if (!photoId) return;

    const preview = photosGallery.querySelector(
        `[data-photo-id="${CSS.escape(photoId)}"]`
    );

    if (!preview?.src || !preview.dataset.objectUrl) {
        showMessage("This image is not available to view yet.");
        return;
    }

    document.getElementById("enlargedPhoto").src = preview.dataset.objectUrl;
    document.getElementById("photoDialog").showModal();
});

document.getElementById("closePhotoDialog").addEventListener("click", () => {
    document.getElementById("photoDialog").close();
});

document.getElementById("photoDialog").addEventListener("close", () => {
    document.getElementById("enlargedPhoto").src = "";
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
    photosGallery.innerHTML = "<p>No booking selected.</p>";
} else {
    Promise.all([loadBooking(), loadPhotos()]).catch((error) => {
        showMessage(error.message);
    });
}