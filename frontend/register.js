const API_BASE = "http://127.0.0.1:8080/api";

const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");

const registerButton =
    document.getElementById("registerButton");

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name")
                .value.trim();

        const email =
            document.getElementById("email")
                .value.trim();

        const password =
            document.getElementById("password")
                .value;

        if (!name || !email || !password) {

            message.textContent =
                "All fields are required.";

            message.style.color =
                "#ff6b6b";

            return;
        }

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating account...";

        try {

            const response = await fetch(
                `${API_BASE}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                message.style.color =
                    "#ff6b6b";

                registerButton.disabled =
                    false;

                registerButton.textContent =
                    "Register";

                return;
            }

            message.textContent =
                "Registration successful!";

            message.style.color =
                "#4ade80";

            setTimeout(function () {

                window.location.replace(
                    window.location.origin +
                    window.location.pathname.replace(
                        "register.html",
                        "index.html"
                    )
                );

            }, 500);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

            message.style.color =
                "#ff6b6b";

            registerButton.disabled =
                false;

            registerButton.textContent =
                "Register";
        }
    }
);