package com.markethub.auth.service;

import com.markethub.auth.dto.AuthDto;
import com.markethub.auth.entity.RefreshToken;
import com.markethub.auth.entity.User;
import com.markethub.auth.repository.RefreshTokenRepository;
import com.markethub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .build();

        var savedUser = userRepository.save(user);
        
        // We'll hydrate UserDetails from User entity
        var userDetails = new org.springframework.security.core.userdetails.User(
            savedUser.getEmail(), 
            savedUser.getPasswordHash(), 
            java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(savedUser.getRole().name()))
        );
        
        var jwtToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateRefreshToken(userDetails);
        
        saveUserRefreshToken(savedUser, refreshToken);
        
        return AuthDto.AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .userRole(savedUser.getRole().name())
                .build();
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var userDetails = new org.springframework.security.core.userdetails.User(
            user.getEmail(), 
            user.getPasswordHash(), 
            java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );

        var jwtToken = jwtService.generateToken(userDetails);
        var refreshToken = jwtService.generateRefreshToken(userDetails);
        
        revokeAllUserTokens(user);
        saveUserRefreshToken(user, refreshToken);
        
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        return AuthDto.AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .userRole(user.getRole().name())
                .build();
    }

    private void saveUserRefreshToken(User user, String jwtToken) {
        var refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(jwtToken) // In a real app we might hash this again, but for now storing the JWT string (which is signed)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = refreshTokenRepository.findAll(); // TODO: Add findByUser or similar if we want to revoke only specific user tokens. 
        // Actually, let's just deleteByUser since we only allow one active refresh token session per user for simplicity in this stage,
        // or we mark them revoked.
        
        // Simpler implementation:
         refreshTokenRepository.deleteByUser(user);
    }
}
