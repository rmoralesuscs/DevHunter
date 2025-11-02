package com.devhunter.ingest.repository;

import com.devhunter.ingest.domain.Artifact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArtifactRepository extends JpaRepository<Artifact, UUID> {

    List<Artifact> findByRunId(UUID runId);
}

