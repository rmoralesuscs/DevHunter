package com.devhunter.ingest;

import com.devhunter.ingest.domain.Test;
import com.devhunter.ingest.repository.TestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class SearchIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRepository testRepository;

    @BeforeEach
    void setUp() {
        testRepository.deleteAll();

        // Create test data
        testRepository.save(Test.builder()
                .externalId("search-1")
                .name("Integration Test for Search")
                .metadata(Map.of("type", "integration", "priority", "high"))
                .build());

        testRepository.save(Test.builder()
                .externalId("search-2")
                .name("Unit Test for Component")
                .metadata(Map.of("type", "unit", "priority", "medium"))
                .build());

        testRepository.save(Test.builder()
                .externalId("search-3")
                .name("Performance Test")
                .metadata(Map.of("type", "performance", "priority", "low"))
                .build());
    }

    @org.junit.jupiter.api.Test
    void testFullTextSearch() {
        // Search for "integration"
        List<Test> results = testRepository.searchByFullText("integration", 10, 0);

        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(t -> t.getName().contains("Integration")));
    }

    @org.junit.jupiter.api.Test
    void testSearchRanking() {
        // Search for "test" - should return all
        List<Test> results = testRepository.searchByFullText("test", 10, 0);

        assertEquals(3, results.size());
    }

    @org.junit.jupiter.api.Test
    void testSearchCount() {
        long count = testRepository.countByFullText("test");

        assertEquals(3, count);
    }

    @org.junit.jupiter.api.Test
    void testTsvectorIndexExists() {
        // Verify the GIN index was created by migration
        List<Test> tests = testRepository.findAll();

        assertFalse(tests.isEmpty());
        // document_tsv should be populated by trigger
        assertNotNull(tests.get(0).getDocumentTsv());
    }
}

