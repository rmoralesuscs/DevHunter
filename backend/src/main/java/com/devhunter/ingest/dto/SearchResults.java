package com.devhunter.ingest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResults {

    private Long total;
    private List<SearchItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchItem {
        private UUID id;
        private String type;
        private Double score;
        private String snippet;
    }
}

