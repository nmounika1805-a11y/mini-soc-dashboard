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
    CommandLineRunner setupAdmin(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "monaco@testt.com";

            User admin = userRepository
                    .findByEmailIgnoreCase(adminEmail)
                    .orElse(null);

            if (admin != null) {

                admin.setName("Mounika");
                admin.setRole("ADMIN");

                /*
                 * Keep the existing password if the account
                 * was registered through the website.
                 *
                 * We don't overwrite it here.
                 */

                userRepository.save(admin);

                System.out.println("======================================");
                System.out.println("ADMIN ACCOUNT READY");
                System.out.println("Name: Mounika");
                System.out.println("Email: monaco@testt.com");
                System.out.println("Role: ADMIN");
                System.out.println("======================================");

            } else {

                /*
                 * If the account does not exist, create it.
                 */

                User newAdmin = new User();

                newAdmin.setName("Mounika");
                newAdmin.setEmail(adminEmail);
                newAdmin.setPassword(
                        passwordEncoder.encode("mouni@0910")
                );
                newAdmin.setRole("ADMIN");

                userRepository.save(newAdmin);

                System.out.println("======================================");
                System.out.println("ADMIN ACCOUNT CREATED");
                System.out.println("Name: Mounika");
                System.out.println("Email: monaco@testt.com");
                System.out.println("======================================");
            }
        };
    }
}