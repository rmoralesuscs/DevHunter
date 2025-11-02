package com.devhunter.ingest.repository;

import com.devhunter.ingest.domain.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OperationRepository extends JpaRepository<Operation, UUID> {

    @Query("SELECT o FROM Operation o WHERE o.status = 'PENDING' ORDER BY o.createdAt ASC")
    List<Operation> findPendingOperations();

    List<Operation> findByStatus(Operation.OperationStatus status);
}

