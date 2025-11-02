package com.devhunter.ingest.dto;

import com.devhunter.ingest.domain.Operation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationResponse {

    private UUID id;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<WarningDto> warnings;
    private Map<String, Object> result;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarningDto {
        private String code;
        private String message;
    }

    public static OperationResponse from(Operation operation) {
        return OperationResponse.builder()
            .id(operation.getId())
            .status(operation.getStatus().name())
            .createdAt(operation.getCreatedAt())
            .updatedAt(operation.getUpdatedAt())
            .warnings(operation.getWarnings().stream()
                .map(w -> WarningDto.builder()
                    .code(w.getCode())
                    .message(w.getMessage())
                    .build())
                .toList())
            .result(operation.getPayload())
            .build();
    }
}

