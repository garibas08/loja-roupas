package com.garibas.backend.service;

import com.garibas.backend.entity.UserAccount;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PasswordResetEmailService {

    public void sendPasswordResetCode(UserAccount user, String code) {
        log.info("Codigo de recuperacao para {}: {}. Validade: 15 minutos.", user.getEmail(), code);
    }
}
