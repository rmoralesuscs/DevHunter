
        @NotBlank(message = "content_type is required")
        private String contentType;

        @NotNull(message = "size_bytes is required")
        @Positive(message = "size_bytes must be positive")
        private Long sizeBytes;
    }
}
package com.devhunter.ingest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestRequest {

    @NotBlank(message = "test_id is required")
    private String testId;

    private Map<String, Object> metadata;

    @NotNull(message = "artifact is required")
    private ArtifactInfo artifact;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtifactInfo {

        @NotBlank(message = "filename is required")
        private String filename;

