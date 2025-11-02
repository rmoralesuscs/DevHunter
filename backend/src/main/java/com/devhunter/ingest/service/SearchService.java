package com.devhunter.ingest.service;

import com.devhunter.ingest.domain.Test;
import com.devhunter.ingest.domain.Run;
import com.devhunter.ingest.dto.SearchResults;
import com.devhunter.ingest.repository.TestRepository;
import com.devhunter.ingest.repository.RunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final TestRepository testRepository;
    private final RunRepository runRepository;

    @Transactional(readOnly = true)
    public SearchResults search(String query, int limit, int offset) {
        // Sanitize query for PostgreSQL full-text search
        String sanitizedQuery = sanitizeQuery(query);

        List<SearchResults.SearchItem> items = new ArrayList<>();

        // Search tests
        List<Test> tests = testRepository.searchByFullText(sanitizedQuery, limit / 2, offset / 2);
        tests.forEach(test -> items.add(SearchResults.SearchItem.builder()
                .id(test.getId())
                .type("test")
                .score(1.0) // Would need to extract rank from native query
                .snippet(test.getName())
                .build()));

        // Search runs
        List<Run> runs = runRepository.searchByFullText(sanitizedQuery, limit / 2, offset / 2);
        runs.forEach(run -> items.add(SearchResults.SearchItem.builder()
                .id(run.getId())
                .type("run")
                .score(0.8) // Would need to extract rank from native query
                .snippet(run.getStatus())
                .build()));

        long totalTests = testRepository.countByFullText(sanitizedQuery);
        long totalRuns = runRepository.countByFullText(sanitizedQuery);

        return SearchResults.builder()
                .total(totalTests + totalRuns)
                .items(items)
                .build();
    }

    private String sanitizeQuery(String query) {
        // Convert plain text to tsquery format
        // Replace spaces with & (AND operator)
        return query.trim()
                .replaceAll("\\s+", " & ")
                .replaceAll("[^a-zA-Z0-9&|!() ]", "");
    }
}

