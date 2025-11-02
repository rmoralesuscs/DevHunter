package com.devhunter.ingest.dto;

import com.devhunter.ingest.domain.Artifact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtifactResponse {

    private UUID id;
    private String url;
    private Long sizeBytes;
    private String sha256;
    private String filename;
    private String contentType;

    public static ArtifactResponse from(Artifact artifact) {
        return ArtifactResponse.builder()
            .id(artifact.getId())
            .url(artifact.getUrl())
            .sizeBytes(artifact.getSizeBytes())
            .sha256(artifact.getSha256())
            .filename(artifact.getFilename())
            .contentType(artifact.getContentType())
            .build();
    }
}

