package com.devhunter.ingest.service;

import com.devhunter.ingest.domain.Operation;
import com.devhunter.ingest.domain.Test;
import com.devhunter.ingest.dto.IngestRequest;
import com.devhunter.ingest.dto.OperationResponse;
import com.devhunter.ingest.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IngestService {

    private final TestRepository testRepository;
    private final OperationService operationService;

    @Transactional
    public OperationResponse startIngest(IngestRequest request) {
        log.info("Starting ingest for test: {}", request.getTestId());

        // Create or update test
        Test test = testRepository.findByExternalId(request.getTestId())
                .orElseGet(() -> {
                    Test newTest = Test.builder()
                            .externalId(request.getTestId())
                            .metadata(request.getMetadata())
                            .build();
                    return testRepository.save(newTest);
                });

        // Create async operation
        Map<String, Object> payload = new HashMap<>();
        payload.put("test_id", test.getId().toString());
        payload.put("external_id", request.getTestId());
        payload.put("artifact", request.getArtifact());

        Operation operation = operationService.createOperation("INGEST", payload);

        log.info("Created operation {} for test {}", operation.getId(), request.getTestId());

        return OperationResponse.from(operation);
    }
}

