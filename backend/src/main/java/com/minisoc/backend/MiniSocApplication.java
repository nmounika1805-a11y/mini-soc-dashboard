package com.minisoc.backend;

import com.minisoc.backend.model.User;
import com.minisoc.backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class MiniSocApplication {

    public static void main(String[] args) {
        SpringApplication.run(MiniSocApplication.class, args);
    }

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@minisoc.com";

            if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {

                User admin = new User();

                admin.setName("SOC Administrator");
                admin.setEmail(adminEmail);
                admin.setPassword(
                        passwordEncoder.encode("Admin@123")
                );
                admin.setRole("ADMIN");

                userRepository.save(admin);

                System.out.println("======================================");
                System.out.println("DEFAULT ADMIN CREATED");
                System.out.println("Email: admin@minisoc.com");
                System.out.println("Password: Admin@123");
                System.out.println("======================================");
            }
        };
    }
}