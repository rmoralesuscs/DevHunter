package com.devhunter.ingest.controller;

import com.devhunter.ingest.dto.ArtifactResponse;
import com.devhunter.ingest.dto.FinalizeRequest;
import com.devhunter.ingest.dto.PresignRequest;
import com.devhunter.ingest.dto.PresignResponse;
import com.devhunter.ingest.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/artifacts")
@RequiredArgsConstructor
@Tag(name = "Artifacts", description = "Artifact upload and management")
public class ArtifactController {

    private final StorageService storageService;

    @PostMapping("/presign")
    @Operation(
            summary = "Request presigned upload URL",
            description = "Generate a presigned URL for uploading an artifact to cloud storage",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Presigned URL generated"),
                    @ApiResponse(responseCode = "400", description = "Bad Request"),
                    @ApiResponse(responseCode = "413", description = "Payload Too Large")
            }
    )
    public ResponseEntity<PresignResponse> presign(@Valid @RequestBody PresignRequest request) {
        PresignResponse response = storageService.generatePresignedUpload(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/finalize")
    @Operation(
            summary = "Finalize artifact upload",
            description = "Verify and finalize an uploaded artifact with checksum validation",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Upload finalized"),
                    @ApiResponse(responseCode = "400", description = "Bad Request"),
                    @ApiResponse(responseCode = "409", description = "Checksum or size mismatch")
            }
    )
    public ResponseEntity<ArtifactResponse> finalize(@Valid @RequestBody FinalizeRequest request) {
        ArtifactResponse response = storageService.finalizeUpload(request);
        return ResponseEntity.ok(response);
    }
}

