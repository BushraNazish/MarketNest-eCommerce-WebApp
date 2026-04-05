package com.markethub.auth.repository;

import com.markethub.auth.entity.User;
import com.markethub.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    long countByRole(UserRole role);
    java.util.List<User> findAllByRole(UserRole role);
}
