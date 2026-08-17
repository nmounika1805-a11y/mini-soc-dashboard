const API_BASE =
    "http://127.0.0.1:8080/api";

let alerts = [];
let currentUser = null;


/* =========================================
   ELEMENTS
========================================= */

const welcomeUser =
    document.getElementById("welcomeUser");

const roleBadge =
    document.getElementById("roleBadge");

const logoutButton =
    document.getElementById("logoutButton");

const addAlertButton =
    document.getElementById("addAlertButton");

const refreshButton =
    document.getElementById("refreshButton");

const alertsTableBody =
    document.getElementById("alertsTableBody");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const totalAlerts =
    document.getElementById("totalAlerts");

const activeAlerts =
    document.getElementById("activeAlerts");

const resolvedAlerts =
    document.getElementById("resolvedAlerts");

const criticalAlerts =
    document.getElementById("criticalAlerts");

const searchInput =
    document.getElementById("searchInput");

const severityFilter =
    document.getElementById("severityFilter");

const statusFilter =
    document.getElementById("statusFilter");

const alertCount =
    document.getElementById("alertCount");

const alertModal =
    document.getElementById("alertModal");

const viewModal =
    document.getElementById("viewModal");

const alertForm =
    document.getElementById("alertForm");

const modalTitle =
    document.getElementById("modalTitle");

const modalMessage =
    document.getElementById("modalMessage");

const liveClock =
    document.getElementById("liveClock");

const securityState =
    document.getElementById("securityState");


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


/* =========================================
   INITIALIZE
========================================= */

async function initializeDashboard() {

    startClock();

    try {

        const response =
            await fetch(
                `${API_BASE}/auth/me`,
                {
                    credentials: "include"
                }
            );


        if (!response.ok) {

            window.location.replace(
                "login.html"
            );

            return;
        }


        currentUser =
            await response.json();


        welcomeUser.textContent =
            `Welcome, ${currentUser.name}`;


        roleBadge.textContent =
            String(
                currentUser.role || "USER"
            ).toUpperCase();


        const role =
            String(
                currentUser.role || ""
            ).toUpperCase();


        if (role === "ADMIN") {

            addAlertButton.classList.remove(
                "hidden"
            );

            roleBadge.classList.add(
                "admin-role"
            );

        } else {

            roleBadge.classList.add(
                "user-role"
            );
        }


        await loadAlerts();

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

        window.location.replace(
            "login.html"
        );
    }
}


/* =========================================
   CLOCK
========================================= */

function startClock() {

    updateClock();

    setInterval(
        updateClock,
        1000
    );
}


function updateClock() {

    if (!liveClock) {
        return;
    }

    const now =
        new Date();

    liveClock.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


/* =========================================
   LOAD ALERTS
========================================= */

async function loadAlerts() {

    loading.classList.remove(
        "hidden"
    );

    errorMessage.classList.add(
        "hidden"
    );


    try {

        const response =
            await fetch(
                `${API_BASE}/alerts`,
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401
            ) {

                window.location.replace(
                    "login.html"
                );

                return;
            }

            throw new Error(
                data.message ||
                "Unable to load alerts."
            );
        }


        alerts =
            Array.isArray(data)
                ? data
                : [];


        updateStatistics();

        updateThreatOverview();

        updateSecurityHealth();

        renderAlerts();

    } catch (error) {

        console.error(
            "Alert loading error:",
            error
        );

        errorMessage.textContent =
            error.message ||
            "Unable to load alerts.";

        errorMessage.classList.remove(
            "hidden"
        );

    } finally {

        loading.classList.add(
            "hidden"
        );
    }
}


/* =========================================
   REFRESH
========================================= */

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async function () {

            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "↻ Loading...";


            await loadAlerts();


            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";
        }
    );
}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    const total =
        alerts.length;


    const active =
        alerts.filter(
            alert =>
                String(
                    alert.status || ""
                ).toUpperCase() ===
                "ACTIVE"
        ).length;


    const resolved =
        alerts.filter(
            alert =>
                String(
                    alert.status || ""
                ).toUpperCase() ===
                "RESOLVED"
        ).length;


    const critical =
        alerts.filter(
            alert =>
                String(
                    alert.severity || ""
                ).toUpperCase() ===
                "CRITICAL"
        ).length;


    totalAlerts.textContent =
        total;

    activeAlerts.textContent =
        active;

    resolvedAlerts.textContent =
        resolved;

    criticalAlerts.textContent =
        critical;
}


/* =========================================
   THREAT OVERVIEW
========================================= */

function updateThreatOverview() {

    const total =
        alerts.length;

    const critical =
        countSeverity("CRITICAL");

    const high =
        countSeverity("HIGH");

    const medium =
        countSeverity("MEDIUM");

    const low =
        countSeverity("LOW");


    setText(
        "criticalCountSmall",
        critical
    );

    setText(
        "highCountSmall",
        high
    );

    setText(
        "mediumCountSmall",
        medium
    );

    setText(
        "lowCountSmall",
        low
    );


    setBar(
        "criticalBar",
        critical,
        total
    );

    setBar(
        "highBar",
        high,
        total
    );

    setBar(
        "mediumBar",
        medium,
        total
    );

    setBar(
        "lowBar",
        low,
        total
    );


    updateSecurityState(
        critical,
        high,
        total
    );
}


function countSeverity(severity) {

    return alerts.filter(
        alert =>
            String(
                alert.severity || ""
            ).toUpperCase() ===
            severity
    ).length;
}


function setBar(
    id,
    value,
    total
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    if (total === 0) {

        element.style.width =
            "0%";

        return;
    }


    element.style.width =
        `${(value / total) * 100}%`;
}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================
   SECURITY STATE
========================================= */

function updateSecurityState(
    critical,
    high,
    total
) {

    if (!securityState) {
        return;
    }


    securityState.className =
        "security-state";


    if (critical > 0) {

        securityState.textContent =
            "CRITICAL";

        securityState.classList.add(
            "danger"
        );

        return;
    }


    if (high > 0) {

        securityState.textContent =
            "ELEVATED";

        securityState.classList.add(
            "warning"
        );

        return;
    }


    if (total > 0) {

        securityState.textContent =
            "MONITORING";

        return;
    }


    securityState.textContent =
        "STABLE";
}


/* =========================================
   SECURITY HEALTH
========================================= */

function updateSecurityHealth() {

    const healthPercentage =
        document.getElementById(
            "healthPercentage"
        );

    const healthRing =
        document.getElementById(
            "healthRing"
        );

    const healthStatus =
        document.getElementById(
            "healthStatus"
        );

    const healthMessage =
        document.getElementById(
            "healthMessage"
        );

    const healthBadge =
        document.getElementById(
            "healthBadge"
        );


    if (
        !healthPercentage ||
        !healthRing
    ) {
        return;
    }


    const activeAlertsList =
        alerts.filter(
            alert =>
                String(
                    alert.status || ""
                ).toUpperCase() ===
                "ACTIVE"
        );


    let riskPoints = 0;


    activeAlertsList.forEach(
        alert => {

            const severity =
                String(
                    alert.severity || ""
                ).toUpperCase();


            if (severity === "CRITICAL") {

                riskPoints += 20;

            } else if (
                severity === "HIGH"
            ) {

                riskPoints += 10;

            } else if (
                severity === "MEDIUM"
            ) {

                riskPoints += 5;

            } else if (
                severity === "LOW"
            ) {

                riskPoints += 2;
            }
        }
    );


    const health =
        Math.max(
            0,
            Math.min(
                100,
                100 - riskPoints
            )
        );


    healthPercentage.textContent =
        `${health}%`;


    const degrees =
        health * 3.6;


    let ringColor =
        "#43e69a";

    let status =
        "Excellent";

    let message =
        "Security environment is currently healthy.";

    let badge =
        "HEALTHY";


    if (health < 80) {

        ringColor =
            "#e8d34f";

        status =
            "Good";

        message =
            "Some security events require attention.";

        badge =
            "MONITOR";
    }


    if (health < 60) {

        ringColor =
            "#ffad66";

        status =
            "Elevated Risk";

        message =
            "Active threats are affecting the security posture.";

        badge =
            "ELEVATED";
    }


    if (health < 30) {

        ringColor =
            "#ff5c73";

        status =
            "Critical Risk";

        message =
            "Immediate attention is recommended for active threats.";

        badge =
            "CRITICAL";
    }


    healthRing.style.background =
        `conic-gradient(
            ${ringColor} 0deg,
            ${ringColor} ${degrees}deg,
            #1b3042 ${degrees}deg,
            #1b3042 360deg
        )`;


    healthStatus.textContent =
        status;

    healthMessage.textContent =
        message;

    healthBadge.textContent =
        badge;


    healthBadge.style.color =
        ringColor;

    healthBadge.style.background =
        `${ringColor}18`;
}


/* =========================================
   FILTER
========================================= */

function getFilteredAlerts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const severity =
        severityFilter.value;


    const status =
        statusFilter.value;


    return alerts.filter(
        alert => {

            const title =
                String(
                    alert.title || ""
                ).toLowerCase();


            const description =
                String(
                    alert.description || ""
                ).toLowerCase();


            const sourceIp =
                String(
                    alert.sourceIp || ""
                ).toLowerCase();


            const destinationIp =
                String(
                    alert.destinationIp || ""
                ).toLowerCase();


            const note =
                String(
                    alert.note || ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                title.includes(search) ||
                description.includes(search) ||
                sourceIp.includes(search) ||
                destinationIp.includes(search) ||
                note.includes(search);


            const matchesSeverity =
                severity === "ALL" ||
                String(
                    alert.severity || ""
                ).toUpperCase() ===
                severity;


            const matchesStatus =
                status === "ALL" ||
                String(
                    alert.status || ""
                ).toUpperCase() ===
                status;


            return (
                matchesSearch &&
                matchesSeverity &&
                matchesStatus
            );
        }
    );
}


/* =========================================
   RENDER ALERTS
========================================= */

function renderAlerts() {

    const filtered =
        getFilteredAlerts();


    alertsTableBody.innerHTML =
        "";


    alertCount.textContent =
        `${filtered.length} alert${
            filtered.length === 1
                ? ""
                : "s"
        }`;


    if (filtered.length === 0) {

        alertsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty"
                >
                    No security alerts match your filters.
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(
        alert => {

            const row =
                document.createElement(
                    "tr"
                );


            const severityClass =
                getSeverityClass(
                    alert.severity
                );


            const statusClass =
                getStatusClass(
                    alert.status
                );


            row.innerHTML = `

                <td>

                    <div class="event-title">

                        <div class="event-icon">
                            ⚡
                        </div>

                        <div class="event-info">

                            <strong>
                                ${escapeHtml(
                                    alert.title ||
                                    "Security Event"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    alert.description ||
                                    "Security event detected"
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    <span
                        class="badge ${severityClass}"
                    >
                        ${escapeHtml(
                            alert.severity ||
                            "UNKNOWN"
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="badge ${statusClass}"
                    >
                        ${escapeHtml(
                            alert.status ||
                            "UNKNOWN"
                        )}
                    </span>

                </td>


                <td>

                    <span class="ip-address">
                        ${escapeHtml(
                            alert.sourceIp ||
                            "—"
                        )}
                    </span>

                </td>


                <td>

                    <span class="ip-address">
                        ${escapeHtml(
                            alert.destinationIp ||
                            "—"
                        )}
                    </span>

                </td>


                <td>
                    ${formatDate(
                        alert.time
                    )}
                </td>


                <td class="actions">

                    <button
                        class="view-button"
                        onclick="viewAlert(${alert.id})"
                    >
                        View
                    </button>


                    ${
                        isAdmin()

                        ? `

                            <button
                                class="edit-button"
                                onclick="editAlert(${alert.id})"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-button"
                                onclick="deleteAlert(${alert.id})"
                            >
                                Delete
                            </button>

                        `

                        : ""
                    }

                </td>

            `;


            alertsTableBody.appendChild(
                row
            );
        }
    );
}


/* =========================================
   VIEW ALERT
========================================= */

function viewAlert(id) {

    const alert =
        alerts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!alert) {
        return;
    }


    const viewContent =
        document.getElementById(
            "viewContent"
        );


    viewContent.innerHTML = `

        <div class="detail-row">

            <span>
                Alert Title
            </span>

            <strong>
                ${escapeHtml(
                    alert.title ||
                    "Security Event"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Severity
            </span>

            <strong>

                <span
                    class="badge ${getSeverityClass(
                        alert.severity
                    )}"
                >
                    ${escapeHtml(
                        alert.severity ||
                        "UNKNOWN"
                    )}
                </span>

            </strong>

        </div>


        <div class="detail-row">

            <span>
                Status
            </span>

            <strong>

                <span
                    class="badge ${getStatusClass(
                        alert.status
                    )}"
                >
                    ${escapeHtml(
                        alert.status ||
                        "UNKNOWN"
                    )}
                </span>

            </strong>

        </div>


        <div class="detail-row">

            <span>
                Source IP
            </span>

            <strong>
                ${escapeHtml(
                    alert.sourceIp ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Destination IP
            </span>

            <strong>
                ${escapeHtml(
                    alert.destinationIp ||
                    "Not provided"
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Detection Time
            </span>

            <strong>
                ${formatDate(
                    alert.time
                )}
            </strong>

        </div>


        <div class="detail-block">

            <span>
                Description
            </span>

            <p>
                ${escapeHtml(
                    alert.description ||
                    "No description provided."
                )}
            </p>

        </div>


        <div class="detail-block">

            <span>
                Investigation Note
            </span>

            <p>
                ${escapeHtml(
                    alert.note ||
                    "No investigation note."
                )}
            </p>

        </div>

    `;


    viewModal.classList.remove(
        "hidden"
    );
}


/* =========================================
   ADMIN CHECK
========================================= */

function isAdmin() {

    return (
        currentUser &&
        String(
            currentUser.role || ""
        ).toUpperCase() ===
        "ADMIN"
    );
}


/* =========================================
   OPEN ADD ALERT
========================================= */

addAlertButton.addEventListener(
    "click",
    function () {

        if (!isAdmin()) {
            return;
        }


        alertForm.reset();


        document.getElementById(
            "alertId"
        ).value = "";


        modalTitle.textContent =
            "Add Alert";


        modalMessage.textContent =
            "";

        modalMessage.style.color =
            "";


        alertModal.classList.remove(
            "hidden"
        );
    }
);


/* =========================================
   EDIT ALERT
========================================= */

function editAlert(id) {

    if (!isAdmin()) {
        return;
    }


    const alert =
        alerts.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!alert) {
        return;
    }


    document.getElementById(
        "alertId"
    ).value =
        alert.id;


    document.getElementById(
        "alertTitle"
    ).value =
        alert.title || "";


    document.getElementById(
        "alertSeverity"
    ).value =
        alert.severity || "MEDIUM";


    document.getElementById(
        "alertStatus"
    ).value =
        alert.status || "ACTIVE";


    document.getElementById(
        "sourceIp"
    ).value =
        alert.sourceIp || "";


    document.getElementById(
        "destinationIp"
    ).value =
        alert.destinationIp || "";


    document.getElementById(
        "alertDescription"
    ).value =
        alert.description || "";


    document.getElementById(
        "alertNote"
    ).value =
        alert.note || "";


    modalTitle.textContent =
        "Edit Alert";


    modalMessage.textContent =
        "";

    modalMessage.style.color =
        "";


    alertModal.classList.remove(
        "hidden"
    );
}


/* =========================================
   SAVE ALERT
========================================= */

alertForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!isAdmin()) {
            return;
        }


        const id =
            document.getElementById(
                "alertId"
            ).value;


        const alertData = {

            title:
                document.getElementById(
                    "alertTitle"
                ).value.trim(),

            severity:
                document.getElementById(
                    "alertSeverity"
                ).value,

            status:
                document.getElementById(
                    "alertStatus"
                ).value,

            sourceIp:
                document.getElementById(
                    "sourceIp"
                ).value.trim(),

            destinationIp:
                document.getElementById(
                    "destinationIp"
                ).value.trim(),

            description:
                document.getElementById(
                    "alertDescription"
                ).value.trim(),

            note:
                document.getElementById(
                    "alertNote"
                ).value.trim()
        };


        if (!alertData.title) {

            modalMessage.textContent =
                "Alert title is required.";

            modalMessage.style.color =
                "#ff5c73";

            return;
        }


        const method =
            id
                ? "PUT"
                : "POST";


        const url =
            id
                ? `${API_BASE}/alerts/${id}`
                : `${API_BASE}/alerts`;


        try {

            const response =
                await fetch(
                    url,
                    {
                        method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify(
                                alertData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                modalMessage.textContent =
                    data.message ||
                    "Unable to save alert.";

                modalMessage.style.color =
                    "#ff5c73";

                return;
            }


            alertModal.classList.add(
                "hidden"
            );


            await loadAlerts();

        } catch (error) {

            console.error(
                "Save alert error:",
                error
            );

            modalMessage.textContent =
                "Unable to connect to the server.";

            modalMessage.style.color =
                "#ff5c73";
        }
    }
);


/* =========================================
   DELETE ALERT
========================================= */

async function deleteAlert(id) {

    if (!isAdmin()) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this alert?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/alerts/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to delete alert."
            );

            return;
        }


        await loadAlerts();

    } catch (error) {

        console.error(
            "Delete alert error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
    "click",
    async function () {

        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Logging out...";


        try {

            await fetch(
                `${API_BASE}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            window.location.replace(
                "login.html"
            );
        }
    }
);


/* =========================================
   CLOSE MODALS
========================================= */

document.getElementById(
    "closeModalButton"
).addEventListener(
    "click",
    closeAlertModal
);


document.getElementById(
    "cancelModalButton"
).addEventListener(
    "click",
    closeAlertModal
);


document.getElementById(
    "closeViewButton"
).addEventListener(
    "click",
    closeViewModal
);


function closeAlertModal() {

    alertModal.classList.add(
        "hidden"
    );
}


function closeViewModal() {

    viewModal.classList.add(
        "hidden"
    );
}


/* =========================================
   OUTSIDE CLICK
========================================= */

alertModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            alertModal
        ) {

            closeAlertModal();
        }
    }
);


viewModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            viewModal
        ) {

            closeViewModal();
        }
    }
);


/* =========================================
   ESCAPE
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeAlertModal();

            closeViewModal();
        }
    }
);


/* =========================================
   FILTER EVENTS
========================================= */

searchInput.addEventListener(
    "input",
    renderAlerts
);


severityFilter.addEventListener(
    "change",
    renderAlerts
);


statusFilter.addEventListener(
    "change",
    renderAlerts
);


/* =========================================
   HELPERS
========================================= */

function getSeverityClass(
    severity
) {

    switch (
        String(
            severity || ""
        ).toUpperCase()
    ) {

        case "CRITICAL":
            return "critical";

        case "HIGH":
            return "high";

        case "MEDIUM":
            return "medium";

        default:
            return "low";
    }
}


function getStatusClass(
    status
) {

    return (
        String(
            status || ""
        ).toUpperCase() ===
        "ACTIVE"
    )

        ? "active"

        : "resolved";
}


function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleString(
        [],
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}