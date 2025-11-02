package com.devhunter.ingest.repository;

import com.devhunter.ingest.domain.IdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyRepository extends JpaRepository<IdempotencyRecord, UUID> {

    Optional<IdempotencyRecord> findByIdempotencyKey(String idempotencyKey);

    @Modifying
    @Query("DELETE FROM IdempotencyRecord i WHERE i.expiresAt < :now")
    int deleteExpiredRecords(Instant now);
}

