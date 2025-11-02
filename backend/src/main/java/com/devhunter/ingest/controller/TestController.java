package com.devhunter.ingest.controller;

import com.devhunter.ingest.domain.Test;
import com.devhunter.ingest.exception.StaleResourceException;
import com.devhunter.ingest.repository.TestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Tests", description = "Test CRUD operations")
public class TestController {

    private final TestRepository testRepository;

    @GetMapping
    @Operation(summary = "List all tests")
    public ResponseEntity<List<Test>> listTests() {
        return ResponseEntity.ok(testRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test by ID")
    public ResponseEntity<Test> getTest(@PathVariable UUID id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test not found: " + id));

        // Generate ETag based on version
        String etag = "\"" + test.getVersion() + "\"";

        return ResponseEntity.ok()
                .eTag(etag)
                .body(test);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update test",
            description = "Update a test with optimistic locking via ETag (412 on stale)"
    )
    public ResponseEntity<Test> updateTest(
            @PathVariable UUID id,
            @RequestBody Test updatedTest,
            @RequestHeader(value = "If-Match", required = false) String ifMatch) {

        Test existing = testRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test not found: " + id));

        // Check ETag if provided
        if (ifMatch != null) {
            String currentEtag = "\"" + existing.getVersion() + "\"";
            if (!ifMatch.equals(currentEtag)) {
                throw new StaleResourceException(
                        "Resource has been modified. Expected version: " + ifMatch +
                        ", current version: " + currentEtag);
            }
        }

        // Update fields
        existing.setName(updatedTest.getName());
        existing.setMetadata(updatedTest.getMetadata());

        try {
            Test saved = testRepository.save(existing);
            String newEtag = "\"" + saved.getVersion() + "\"";

            return ResponseEntity.ok()
                    .eTag(newEtag)
                    .body(saved);
        } catch (OptimisticLockException e) {
            throw new StaleResourceException("Concurrent modification detected");
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete test")
    public ResponseEntity<Void> deleteTest(@PathVariable UUID id) {
        testRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

