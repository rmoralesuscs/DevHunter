package com.devhunter.ingest.controller;

import com.devhunter.ingest.dto.IngestRequest;
import com.devhunter.ingest.dto.OperationResponse;
import com.devhunter.ingest.service.IdempotencyService;
import com.devhunter.ingest.service.IngestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
@Tag(name = "Ingest", description = "Async ingest operations")
public class IngestController {

    private final IngestService ingestService;
    private final IdempotencyService idempotencyService;

    @PostMapping("/ingest")
    @Operation(
            summary = "Start async ingest",
            description = "Initiates an asynchronous ingest operation and returns 202 with operation ID",
            responses = {
                    @ApiResponse(responseCode = "202", description = "Accepted",
                            headers = @Header(name = "Location", description = "URL to poll operation status")),
                    @ApiResponse(responseCode = "400", description = "Bad Request"),
                    @ApiResponse(responseCode = "413", description = "Payload Too Large"),
                    @ApiResponse(responseCode = "415", description = "Unsupported Media Type")
            }
    )
    public ResponseEntity<OperationResponse> startIngest(
            @Valid @RequestBody IngestRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        // Check idempotency
        if (idempotencyKey != null) {
            var existing = idempotencyService.findByKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Returning cached response for idempotency key: {}", idempotencyKey);

                @SuppressWarnings("unchecked")
                Map<String, Object> cachedBody = existing.get().getResponseBody();
                // Convert back to OperationResponse (simplified)
                return ResponseEntity.status(existing.get().getResponseCode())
                        .header("Location", "/v1/operations/" + cachedBody.get("id"))
                        .body(convertToOperationResponse(cachedBody));
            }
        }

        OperationResponse response = ingestService.startIngest(request);

        // Store idempotency record
        if (idempotencyKey != null) {
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", response.getId().toString());
            responseBody.put("status", response.getStatus());
            idempotencyService.store(idempotencyKey, request.toString(),
                    HttpStatus.ACCEPTED.value(), responseBody);
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .header("Location", "/v1/operations/" + response.getId())
                .body(response);
    }

    private OperationResponse convertToOperationResponse(Map<String, Object> map) {
        // Simplified conversion - in production use proper mapper
        return OperationResponse.builder()
                .id(java.util.UUID.fromString((String) map.get("id")))
                .status((String) map.get("status"))
                .build();
    }
}

