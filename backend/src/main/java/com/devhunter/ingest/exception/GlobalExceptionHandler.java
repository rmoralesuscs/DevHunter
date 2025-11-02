
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String PROBLEM_BASE_URL = "https://api.example.com/probs/";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {

        List<Map<String, Object>> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            Map<String, Object> errorDetail = new HashMap<>();
            errorDetail.put("field", error.getField());
            errorDetail.put("message", error.getDefaultMessage());
            errorDetail.put("rejectedValue", error.getRejectedValue());
            errors.add(errorDetail);
        }

        ProblemDetail problem = ProblemDetail.builder()
                .type(PROBLEM_BASE_URL + "invalid-request")
                .title("Invalid request")
                .status(HttpStatus.BAD_REQUEST.value())
                .detail("Validation failed for one or more fields")
                .instance(request.getDescription(false))
                .errors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {

        HttpStatus status = determineStatus(ex.getMessage());

        ProblemDetail problem = ProblemDetail.builder()
                .type(PROBLEM_BASE_URL + "invalid-argument")
                .title("Invalid argument")
                .status(status.value())
                .detail(ex.getMessage())
                .instance(request.getDescription(false))
                .build();

        return ResponseEntity.status(status)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalState(
            IllegalStateException ex, WebRequest request) {

        ProblemDetail problem = ProblemDetail.builder()
                .type(PROBLEM_BASE_URL + "conflict")
                .title("Conflict")
                .status(HttpStatus.CONFLICT.value())
                .detail(ex.getMessage())
                .instance(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(StaleResourceException.class)
    public ResponseEntity<ProblemDetail> handleStaleResource(
            StaleResourceException ex, WebRequest request) {

        ProblemDetail problem = ProblemDetail.builder()
                .type(PROBLEM_BASE_URL + "stale-resource")
                .title("Precondition Failed")
                .status(HttpStatus.PRECONDITION_FAILED.value())
                .detail(ex.getMessage())
                .instance(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(
            Exception ex, WebRequest request) {

        log.error("Unhandled exception", ex);

        ProblemDetail problem = ProblemDetail.builder()
                .type(PROBLEM_BASE_URL + "internal-error")
                .title("Internal Server Error")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .detail("An unexpected error occurred")
                .instance(request.getDescription(false))
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("Content-Type", "application/problem+json")
                .body(problem);
    }

    private HttpStatus determineStatus(String message) {
        if (message.contains("too large") || message.contains("max")) {
            return HttpStatus.PAYLOAD_TOO_LARGE;
        }
        if (message.contains("Unsupported")) {
            return HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        }
        if (message.contains("not found")) {
            return HttpStatus.NOT_FOUND;
        }
        return HttpStatus.BAD_REQUEST;
    }
}
package com.devhunter.ingest.exception;

import com.devhunter.ingest.dto.ProblemDetail;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

