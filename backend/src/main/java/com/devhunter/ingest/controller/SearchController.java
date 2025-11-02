package com.devhunter.ingest.controller;

import com.devhunter.ingest.dto.SearchResults;
import com.devhunter.ingest.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Full-text search operations")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(
            summary = "Full-text search",
            description = "Search across tests and runs using PostgreSQL full-text search"
    )
    public ResponseEntity<SearchResults> search(
            @Parameter(description = "Search query", required = true)
            @RequestParam String q,

            @Parameter(description = "Maximum results to return")
            @RequestParam(defaultValue = "20") int limit,

            @Parameter(description = "Offset for pagination")
            @RequestParam(defaultValue = "0") int offset) {

        SearchResults results = searchService.search(q, limit, offset);
        return ResponseEntity.ok(results);
    }
}

