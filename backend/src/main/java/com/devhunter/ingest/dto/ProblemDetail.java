package com.devhunter.ingest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDetail {

    private String type;
    private String title;
    private Integer status;
    private String detail;
    private String instance;
    private List<Map<String, Object>> errors;
}

