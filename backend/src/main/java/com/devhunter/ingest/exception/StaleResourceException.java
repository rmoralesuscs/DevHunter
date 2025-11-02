package com.devhunter.ingest.exception;

public class StaleResourceException extends RuntimeException {
    public StaleResourceException(String message) {
        super(message);
    }
}

