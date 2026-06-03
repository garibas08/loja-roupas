package com.garibas.backend.exception;

import java.time.Instant;
import java.util.Map;

public record RespostaErroApi(
    Instant timestamp,
    int status,
    String error,
    String message,
    Map<String, String> fieldErrors
) {
}
