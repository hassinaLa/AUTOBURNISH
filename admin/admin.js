
const API_BASE_URL = "http://127.0.0.1:8000";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginMessage.textContent = "";
    loginMessage.classList.remove("success");
    loginButton.disabled = true;
    loginButton.querySelector("span").textContent = "Signing in...";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                response.status === 401
                    ? "Invalid username or password."
                    : data.detail || "Login failed. Please try again."
            );
        }

        if (!data.access_token) {
            throw new Error("The server did not return an access token.");
        }

        // Keep the token for this browser tab only.
        sessionStorage.setItem("adminToken", data.access_token);

        loginMessage.classList.add("success");
        loginMessage.textContent = "Login successful.";

        // The dashboard page will be created in our next step.
        window.location.href = "dashboard.html";

    } catch (error) {
        if (error instanceof TypeError) {
            loginMessage.textContent =
                "Cannot connect to the server. Make sure the backend is running.";
        } else {
            loginMessage.textContent = error.message;
        }
    } finally {
        loginButton.disabled = false;
        loginButton.querySelector("span").textContent = "Sign In";
    }
});