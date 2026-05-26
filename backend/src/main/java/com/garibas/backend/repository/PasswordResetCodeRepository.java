package com.garibas.backend.repository;

import com.garibas.backend.entity.PasswordResetCode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    List<PasswordResetCode> findAllByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);
}
