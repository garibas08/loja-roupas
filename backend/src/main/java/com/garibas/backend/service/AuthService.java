package com.garibas.backend.service;

import com.garibas.backend.dto.auth.AuthResponse;
import com.garibas.backend.dto.auth.LoginRequest;
import com.garibas.backend.dto.auth.MessageResponse;
import com.garibas.backend.dto.auth.PasswordResetConfirmRequest;
import com.garibas.backend.dto.auth.PasswordResetRequest;
import com.garibas.backend.dto.auth.RegisterRequest;
import com.garibas.backend.dto.auth.UpdateProfileRequest;
import com.garibas.backend.dto.auth.UserResponse;
import com.garibas.backend.entity.PasswordResetCode;
import com.garibas.backend.entity.UserAccount;
import com.garibas.backend.exception.BadRequestException;
import com.garibas.backend.exception.ConflictException;
import com.garibas.backend.exception.ResourceNotFoundException;
import com.garibas.backend.exception.UnauthorizedException;
import com.garibas.backend.repository.PasswordResetCodeRepository;
import com.garibas.backend.repository.UserRepository;
import com.garibas.backend.security.AuthenticatedUser;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(15);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String PASSWORD_RESET_SENT_MESSAGE =
        "Se o email estiver cadastrado, enviaremos um codigo de recuperacao.";

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final PasswordResetEmailService passwordResetEmailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Ja existe um cadastro com este email.");
        }

        UserAccount user = userRepository.save(
            UserAccount.builder()
                .name(request.name().trim())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build()
        );

        String token = tokenService.issueToken(user);
        return new AuthResponse(token, toUserResponse(user), "Cadastro realizado com sucesso.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new UnauthorizedException("Email ou senha invalidos."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email ou senha invalidos.");
        }

        String token = tokenService.issueToken(user);
        return new AuthResponse(token, toUserResponse(user), "Login realizado com sucesso.");
    }

    @Transactional(readOnly = true)
    public UserResponse me(AuthenticatedUser authenticatedUser) {
        UserAccount user = userRepository.findById(authenticatedUser.id())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(AuthenticatedUser authenticatedUser, UpdateProfileRequest request) {
        UserAccount user = userRepository.findById(authenticatedUser.id())
            .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));

        String email = normalizeEmail(request.email());

        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Ja existe um cadastro com este email.");
        }

        user.setName(request.name().trim());
        user.setEmail(email);

        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public MessageResponse requestPasswordReset(PasswordResetRequest request) {
        userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .ifPresent(this::createAndSendPasswordResetCode);

        return new MessageResponse(PASSWORD_RESET_SENT_MESSAGE);
    }

    @Transactional
    public MessageResponse confirmPasswordReset(PasswordResetConfirmRequest request) {
        UserAccount user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .orElseThrow(() -> new BadRequestException("Codigo invalido ou expirado."));

        PasswordResetCode resetCode = passwordResetCodeRepository
            .findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId()).stream()
            .filter(code -> code.getExpiresAt().isAfter(Instant.now()))
            .filter(code -> passwordEncoder.matches(request.code(), code.getCodeHash()))
            .findFirst()
            .orElseThrow(() -> new BadRequestException("Codigo invalido ou expirado."));

        resetCode.setUsed(true);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        tokenService.revokeActiveTokens(user.getId());

        return new MessageResponse("Senha alterada com sucesso. Faca login novamente.");
    }

    @Transactional
    public void logout(String token) {
        tokenService.revoke(token);
    }

    public UserResponse toUserResponse(UserAccount user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    private void createAndSendPasswordResetCode(UserAccount user) {
        passwordResetCodeRepository.findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId())
            .forEach(code -> code.setUsed(true));

        String code = generatePasswordResetCode();
        PasswordResetCode resetCode = PasswordResetCode.builder()
            .user(user)
            .codeHash(passwordEncoder.encode(code))
            .expiresAt(Instant.now().plus(PASSWORD_RESET_TTL))
            .build();

        passwordResetCodeRepository.save(resetCode);
        passwordResetEmailService.sendPasswordResetCode(user, code);
    }

    private String generatePasswordResetCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
