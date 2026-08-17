package com.minisoc.backend.controller;

import com.minisoc.backend.model.User;
import com.minisoc.backend.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        },
        allowCredentials = "true"
)
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");

        if (name == null ||
                email == null ||
                password == null ||
                name.trim().isEmpty() ||
                email.trim().isEmpty() ||
                password.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(message("All fields are required."));
        }

        email = email.trim().toLowerCase();

        if (password.length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body(message(
                            "Password must contain at least 6 characters."
                    ));
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(message(
                            "This email is already registered. Please login."
                    ));
        }

        User user = new User();

        user.setName(name.trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        session.setAttribute("userId", savedUser.getId());
        session.setAttribute("userName", savedUser.getName());
        session.setAttribute("userRole", savedUser.getRole());

        return ResponseEntity.ok(userResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String email = request.get("email");
        String password = request.get("password");

        if (email == null ||
                password == null ||
                email.trim().isEmpty() ||
                password.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(message(
                            "Email and password are required."
                    ));
        }

        email = email.trim().toLowerCase();

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(message(
                            "Account not found. Please register first."
                    ));
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(message("Incorrect password."));
        }

        session.setAttribute("userId", user.getId());
        session.setAttribute("userName", user.getName());
        session.setAttribute("userRole", user.getRole());

        return ResponseEntity.ok(userResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpSession session) {

        Long userId =
                (Long) session.getAttribute("userId");

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(message("Not logged in."));
        }

        User user =
                userRepository.findById(userId).orElse(null);

        if (user == null) {

            session.invalidate();

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(message("User session is invalid."));
        }

        return ResponseEntity.ok(userResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok(
                message("Logged out successfully.")
        );
    }

    private Map<String, Object> userResponse(User user) {

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        return response;
    }

    private Map<String, String> message(String text) {

        Map<String, String> response =
                new HashMap<>();

        response.put("message", text);

        return response;
    }
}