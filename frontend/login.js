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

const loginForm =
    document.getElementById("loginForm");

const message =
    document.getElementById("message");

const loginButton =
    document.getElementById("loginButton");


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        message.textContent =
            "";


        if (!email || !password) {

            message.textContent =
                "Please enter email and password.";

            message.style.color =
                "#ff6b6b";

            return;
        }


        loginButton.disabled =
            true;

        loginButton.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    `${API_BASE}/auth/login`,
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
                                email:
                                    email,

                                password:
                                    password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Login failed.";

                message.style.color =
                    "#ff6b6b";

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";

                return;
            }


            message.textContent =
                "Login successful!";

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
                "Login error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "#ff6b6b";


            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";
        }
    }
);