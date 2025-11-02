package com.devhunter.ingest.service;

import com.devhunter.ingest.domain.Operation;
import com.devhunter.ingest.repository.OperationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationRepository operationRepository;

    @Transactional
    public Operation createOperation(String type, Map<String, Object> payload) {
        Operation operation = Operation.builder()
                .type(type)
                .status(Operation.OperationStatus.PENDING)
                .payload(payload)
                .build();

        return operationRepository.save(operation);
    }

    @Transactional(readOnly = true)
    public Operation getOperation(UUID id) {
        return operationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Operation not found: " + id));
    }

    @Transactional
    public Operation updateStatus(UUID id, Operation.OperationStatus status) {
        Operation operation = getOperation(id);
        operation.setStatus(status);
        return operationRepository.save(operation);
    }

    @Transactional
    public Operation addWarning(UUID id, String code, String message) {
        Operation operation = getOperation(id);
        operation.getWarnings().add(
                Operation.OperationWarning.builder()
                        .code(code)
                        .message(message)
                        .build()
        );
        return operationRepository.save(operation);
    }

    @Scheduled(fixedDelay = 5000) // Process queue every 5 seconds
    @Transactional
    public void processQueue() {
        List<Operation> pendingOps = operationRepository.findPendingOperations();

        for (Operation op : pendingOps) {
            try {
                processOperation(op);
            } catch (Exception e) {
                log.error("Failed to process operation {}", op.getId(), e);
                op.setStatus(Operation.OperationStatus.FAILED);
                operationRepository.save(op);
            }
        }
    }

    @Async
    @Transactional
    protected void processOperation(Operation operation) {
        log.info("Processing operation: {} (type: {})", operation.getId(), operation.getType());

        operation.setStatus(Operation.OperationStatus.RUNNING);
        operationRepository.save(operation);

        try {
            // Simulate work based on operation type
            switch (operation.getType()) {
                case "INGEST":
                    processIngestOperation(operation);
                    break;
                default:
                    log.warn("Unknown operation type: {}", operation.getType());
            }

            operation.setStatus(Operation.OperationStatus.SUCCEEDED);
        } catch (Exception e) {
            log.error("Operation failed: {}", operation.getId(), e);
            operation.setStatus(Operation.OperationStatus.FAILED);
            operation.getWarnings().add(
                    Operation.OperationWarning.builder()
                            .code("PROCESSING_ERROR")
                            .message(e.getMessage())
                            .build()
            );
        }

        operationRepository.save(operation);
    }

    private void processIngestOperation(Operation operation) {
        // Placeholder for actual ingest logic
        log.info("Processing ingest for operation: {}", operation.getId());

        // Example: Check for version conflicts
        Map<String, Object> payload = operation.getPayload();
        if (payload.containsKey("force_update")) {
            operation.getWarnings().add(
                    Operation.OperationWarning.builder()
                            .code("VERSION_CONFLICT")
                            .message("Forced update due to version conflict")
                            .build()
            );
        }
    }
}

