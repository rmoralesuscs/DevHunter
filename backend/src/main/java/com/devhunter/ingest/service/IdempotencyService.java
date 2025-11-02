package com.devhunter.ingest.service;

import com.devhunter.ingest.domain.IdempotencyRecord;
import com.devhunter.ingest.repository.IdempotencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyRepository idempotencyRepository;

    @Value("${app.idempotency.ttl-hours}")
    private int ttlHours;

    @Transactional
    public Optional<IdempotencyRecord> findByKey(String idempotencyKey) {
        return idempotencyRepository.findByIdempotencyKey(idempotencyKey)
                .filter(record -> record.getExpiresAt().isAfter(Instant.now()));
    }

    @Transactional
    public IdempotencyRecord store(String idempotencyKey, String requestFingerprint,
                                    int responseCode, Map<String, Object> responseBody) {
        IdempotencyRecord record = IdempotencyRecord.builder()
                .idempotencyKey(idempotencyKey)
                .requestFingerprint(requestFingerprint)
                .responseCode(responseCode)
                .responseBody(responseBody)
                .expiresAt(Instant.now().plusSeconds(ttlHours * 3600L))
                .build();

        return idempotencyRepository.save(record);
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredRecords() {
        int deleted = idempotencyRepository.deleteExpiredRecords(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired idempotency records", deleted);
        }
    }
}

