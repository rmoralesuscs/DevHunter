package com.devhunter.ingest.storage;

import com.devhunter.ingest.dto.PresignResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUploadInfo {
    private String presignedId;
    private String uploadUrl;
    private String provider;
    private java.util.Map<String, String> headers;
    private Integer expiresInSeconds;
    private String objectKey;
}

