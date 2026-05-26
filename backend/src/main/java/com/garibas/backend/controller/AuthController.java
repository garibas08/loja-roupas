package com.garibas.backend.controller;

import com.garibas.backend.dto.auth.AuthResponse;
import com.garibas.backend.dto.auth.LoginRequest;
import com.garibas.backend.dto.auth.MessageResponse;
import com.garibas.backend.dto.auth.PasswordResetConfirmRequest;
import com.garibas.backend.dto.auth.PasswordResetRequest;
import com.garibas.backend.dto.auth.RegisterRequest;
import com.garibas.backend.dto.auth.UpdateProfileRequest;
import com.garibas.backend.dto.auth.UserResponse;
import com.garibas.backend.exception.UnauthorizedException;
import com.garibas.backend.security.AuthenticatedUser;
import com.garibas.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.me(authenticatedUser(authentication));
    }

    @PutMapping("/me")
    public UserResponse updateProfile(
        Authentication authentication,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return authService.updateProfile(authenticatedUser(authentication), request);
    }

    @PostMapping("/password-reset/request")
    public MessageResponse requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        return authService.requestPasswordReset(request);
    }

    @PostMapping("/password-reset/confirm")
    public MessageResponse confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        return authService.confirmPasswordReset(request);
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Sessao invalida.");
        }

        authService.logout(authorizationHeader.substring(7));
    }

    private AuthenticatedUser authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new UnauthorizedException("Sessao invalida.");
        }

        return user;
    }
}
