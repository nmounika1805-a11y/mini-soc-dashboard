
/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8080/api"
        : "https://mini-soc-security.onrender.com/api";


/* =========================================
   ELEMENTS
========================================= */

const registerForm =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");

const registerButton =
    document.getElementById("registerButton");


/* =========================================
   REGISTER
========================================= */

if (registerForm) {

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


            message.textContent = "";


            /* =========================================
               VALIDATION
            ========================================= */

            if (!name || !email || !password) {

                message.textContent =
                    "All fields are required.";

                message.style.color =
                    "#ff6b6b";

                return;
            }


            if (password.length < 6) {

                message.textContent =
                    "Password must contain at least 6 characters.";

                message.style.color =
                    "#ff6b6b";

                return;
            }


            /* =========================================
               BUTTON
            ========================================= */

            registerButton.disabled =
                true;

            registerButton.textContent =
                "Creating account...";


            /* =========================================
               REGISTER REQUEST
            ========================================= */

            try {

                const response =
                    await fetch(
                        `${API_BASE}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify({
                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );


                const data =
                    await response.json();


                /* =========================================
                   ERROR RESPONSE
                ========================================= */

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


                /* =========================================
                   SUCCESS
                ========================================= */

                message.textContent =
                    "Registration successful!";

                message.style.color =
                    "#4ade80";


                setTimeout(
                    function () {

                        window.location.replace(
                            "index.html"
                        );

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                message.textContent =
                    "Unable to connect to the server.";

                message.style.color =
                    "#ff6b6b";


                registerButton.disabled =
                    false;

                registerButton.textContent =
                    "Register";
            }
        }
    );
}

