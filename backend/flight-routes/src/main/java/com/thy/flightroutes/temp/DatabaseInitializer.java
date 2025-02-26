package com.thy.flightroutes.temp;

import com.thy.flightroutes.entity.User;
import com.thy.flightroutes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Admin kullanıcısı oluştur
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"), // Şifreyi encode etmeyi unutmayın!
                    "ADMIN"
            );
            userRepository.save(admin);
            log.info("Admin user created");
        }

        // Agency kullanıcısı oluştur
        if (!userRepository.existsByUsername("agency")) {
            User agency = new User(
                    "agency",
                    passwordEncoder.encode("agency123"), // Şifreyi encode etmeyi unutmayın!
                    "AGENCY"
            );
            userRepository.save(agency);
            log.info("Agency user created");
        }
    }
}