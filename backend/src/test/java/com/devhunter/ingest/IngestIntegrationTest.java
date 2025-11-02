package com.devhunter.ingest;

import com.devhunter.ingest.domain.Test;
import com.devhunter.ingest.repository.TestRepository;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class IngestIntegrationTest {

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
        registry.add("app.storage.provider", () -> "azure");
        registry.add("app.storage.azure.connection-string",
                () -> "DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=test;");
    }

    @LocalServerPort
    private Integer port;

    @Autowired
    private TestRepository testRepository;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        testRepository.deleteAll();
    }

    @Test
    void testIngestFlow() {
        // Given
        Map<String, Object> ingestRequest = Map.of(
                "test_id", "test-123",
                "metadata", Map.of("name", "Integration Test"),
                "artifact", Map.of(
                        "filename", "results.json",
                        "content_type", "application/json",
                        "size_bytes", 1024
                )
        );

        // When: Start ingest
        String operationId = given()
                .contentType(ContentType.JSON)
                .body(ingestRequest)
                .when()
                .post("/v1/ingest")
                .then()
                .statusCode(202)
                .header("Location", notNullValue())
                .body("id", notNullValue())
                .body("status", equalTo("PENDING"))
                .extract()
                .path("id");

        // Then: Check operation status
        given()
                .when()
                .get("/v1/operations/" + operationId)
                .then()
                .statusCode(200)
                .body("id", equalTo(operationId))
                .body("status", in(List.of("PENDING", "RUNNING", "SUCCEEDED")));
    }

    @Test
    void testIdempotency() {
        Map<String, Object> request = Map.of(
                "test_id", "test-456",
                "artifact", Map.of(
                        "filename", "test.json",
                        "content_type", "application/json",
                        "size_bytes", 100
                )
        );

        String idempotencyKey = "unique-key-123";

        // First request
        String firstOperationId = given()
                .contentType(ContentType.JSON)
                .header("Idempotency-Key", idempotencyKey)
                .body(request)
                .when()
                .post("/v1/ingest")
                .then()
                .statusCode(202)
                .extract()
                .path("id");

        // Second request with same key - should return same operation
        String secondOperationId = given()
                .contentType(ContentType.JSON)
                .header("Idempotency-Key", idempotencyKey)
                .body(request)
                .when()
                .post("/v1/ingest")
                .then()
                .statusCode(202)
                .extract()
                .path("id");

        assertEquals(firstOperationId, secondOperationId);
    }

    @Test
    void testValidationErrors() {
        Map<String, Object> invalidRequest = Map.of(
                "test_id", "",
                "artifact", Map.of("filename", "test.json")
        );

        given()
                .contentType(ContentType.JSON)
                .body(invalidRequest)
                .when()
                .post("/v1/ingest")
                .then()
                .statusCode(400)
                .contentType("application/problem+json")
                .body("type", containsString("invalid-request"))
                .body("status", equalTo(400));
    }

    @Test
    void testETagSupport() {
        // Create a test
        com.devhunter.ingest.domain.Test test = com.devhunter.ingest.domain.Test.builder()
                .externalId("etag-test")
                .name("ETag Test")
                .metadata(Map.of("key", "value"))
                .build();
        test = testRepository.save(test);

        // Get with ETag
        String etag = given()
                .when()
                .get("/v1/tests/" + test.getId())
                .then()
                .statusCode(200)
                .header("ETag", notNullValue())
                .extract()
                .header("ETag");

        // Update with correct ETag
        test.setName("Updated Name");
        given()
                .contentType(ContentType.JSON)
                .header("If-Match", etag)
                .body(test)
                .when()
                .put("/v1/tests/" + test.getId())
                .then()
                .statusCode(200)
                .header("ETag", not(equalTo(etag)));

        // Update with stale ETag should fail with 412
        given()
                .contentType(ContentType.JSON)
                .header("If-Match", etag)
                .body(test)
                .when()
                .put("/v1/tests/" + test.getId())
                .then()
                .statusCode(412)
                .contentType("application/problem+json");
    }
}

