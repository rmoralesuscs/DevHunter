package com.devhunter.ingest.controller;

import com.devhunter.ingest.dto.OperationResponse;
import com.devhunter.ingest.service.OperationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/operations")
@RequiredArgsConstructor
@Tag(name = "Operations", description = "Operation status tracking")
public class OperationController {

    private final OperationService operationService;

    @GetMapping("/{id}")
    @Operation(
            summary = "Get operation status",
            description = "Retrieve the current status and result of an async operation",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Operation found"),
                    @ApiResponse(responseCode = "404", description = "Operation not found")
            }
    )
    public ResponseEntity<OperationResponse> getOperation(@PathVariable UUID id) {
        com.devhunter.ingest.domain.Operation operation = operationService.getOperation(id);
        return ResponseEntity.ok(OperationResponse.from(operation));
    }
}

