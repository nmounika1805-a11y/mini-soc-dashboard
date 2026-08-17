const API_BASE = "http://127.0.0.1:8080/api";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    message.textContent = "";

    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        message.style.color = "#ff6b6b";

        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {

        const response = await fetch(
            `${API_BASE}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.message || "Login failed.";

            message.style.color = "#ff6b6b";

            loginButton.disabled = false;
            loginButton.textContent = "Login";

            return;
        }

        message.textContent =
            "Login successful!";

        message.style.color = "#4ade80";

        /*
         * Redirect using the actual frontend URL.
         * This avoids problems caused by relative paths.
         */
        setTimeout(function () {

            window.location.replace(
                window.location.origin +
                window.location.pathname.replace(
                    "login.html",
                    "index.html"
                )
            );

        }, 500);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to the server.";

        message.style.color = "#ff6b6b";

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});