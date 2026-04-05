package com.markethub.common.config;

import com.markethub.auth.entity.User;
import com.markethub.auth.entity.UserRole;
import com.markethub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = User.builder()
                    .email("admin@example.com")
                    .passwordHash(passwordEncoder.encode("password"))
                    .role(UserRole.ADMIN)
                    .firstName("System")
                    .lastName("Admin")
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Created test admin user: admin@example.com / password");
        }
    }
}
