package com.minisoc.backend.controller;

import com.minisoc.backend.model.Alert;
import com.minisoc.backend.repository.AlertRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        },
        allowCredentials = "true"
)
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAlerts(HttpSession session) {

        if (!isLoggedIn(session)) {
            return unauthorized();
        }

        List<Alert> alerts =
                alertRepository.findAllByOrderByTimeDesc();

        return ResponseEntity.ok(alerts);
    }

    @PostMapping
    public ResponseEntity<?> createAlert(
            @RequestBody Alert alert,
            HttpSession session) {

        if (!isAdmin(session)) {
            return forbidden();
        }

        if (isEmpty(alert.getTitle())) {
            return badRequest("Alert title is required.");
        }

        if (isEmpty(alert.getSeverity())) {
            return badRequest("Severity is required.");
        }

        if (isEmpty(alert.getStatus())) {
            return badRequest("Status is required.");
        }

        alert.setTitle(alert.getTitle().trim());
        alert.setSeverity(
                alert.getSeverity().trim().toUpperCase()
        );
        alert.setStatus(
                alert.getStatus().trim().toUpperCase()
        );

        alert.setDescription(
                safe(alert.getDescription())
        );

        alert.setSourceIp(
                safe(alert.getSourceIp())
        );

        alert.setDestinationIp(
                safe(alert.getDestinationIp())
        );

        alert.setNote(
                safe(alert.getNote())
        );

        alert.setTime(LocalDateTime.now());

        Alert saved =
                alertRepository.save(alert);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAlert(
            @PathVariable Long id,
            @RequestBody Alert updated,
            HttpSession session) {

        if (!isAdmin(session)) {
            return forbidden();
        }

        Alert existing =
                alertRepository.findById(id).orElse(null);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(message("Alert not found."));
        }

        if (isEmpty(updated.getTitle())) {
            return badRequest("Alert title is required.");
        }

        if (isEmpty(updated.getSeverity())) {
            return badRequest("Severity is required.");
        }

        if (isEmpty(updated.getStatus())) {
            return badRequest("Status is required.");
        }

        existing.setTitle(
                updated.getTitle().trim()
        );

        existing.setSeverity(
                updated.getSeverity()
                        .trim()
                        .toUpperCase()
        );

        existing.setStatus(
                updated.getStatus()
                        .trim()
                        .toUpperCase()
        );

        existing.setDescription(
                safe(updated.getDescription())
        );

        existing.setSourceIp(
                safe(updated.getSourceIp())
        );

        existing.setDestinationIp(
                safe(updated.getDestinationIp())
        );

        existing.setNote(
                safe(updated.getNote())
        );

        Alert saved =
                alertRepository.save(existing);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(
            @PathVariable Long id,
            HttpSession session) {

        if (!isAdmin(session)) {
            return forbidden();
        }

        if (!alertRepository.existsById(id)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(message("Alert not found."));
        }

        alertRepository.deleteById(id);

        return ResponseEntity.ok(
                message("Alert deleted successfully.")
        );
    }

    private boolean isLoggedIn(HttpSession session) {
        return session.getAttribute("userId") != null;
    }

    private boolean isAdmin(HttpSession session) {

        if (!isLoggedIn(session)) {
            return false;
        }

        Object role =
                session.getAttribute("userRole");

        return role != null &&
                "ADMIN".equalsIgnoreCase(
                        role.toString()
                );
    }

    private ResponseEntity<?> unauthorized() {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(message(
                        "Please login to access the dashboard."
                ));
    }

    private ResponseEntity<?> forbidden() {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(message(
                        "Admin access required."
                ));
    }

    private ResponseEntity<?> badRequest(String text) {

        return ResponseEntity
                .badRequest()
                .body(message(text));
    }

    private boolean isEmpty(String value) {

        return value == null ||
                value.trim().isEmpty();
    }

    private String safe(String value) {

        return value == null
                ? ""
                : value.trim();
    }

    private Map<String, String> message(String text) {

        Map<String, String> response =
                new HashMap<>();

        response.put("message", text);

        return response;
    }
}