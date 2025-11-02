package com.devhunter.ingest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignResponse {

    private String provider;
    private String uploadUrl;
    private Map<String, String> fields;
    private Integer expiresInSeconds;
    private String presignedId;
}

