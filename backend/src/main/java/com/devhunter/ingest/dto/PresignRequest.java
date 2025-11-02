package com.devhunter.ingest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignRequest {

    @NotBlank(message = "filename is required")
    private String filename;

    @NotBlank(message = "content_type is required")
    private String contentType;

    @NotNull(message = "size_bytes is required")
    @Positive(message = "size_bytes must be positive")
    private Long sizeBytes;
}

