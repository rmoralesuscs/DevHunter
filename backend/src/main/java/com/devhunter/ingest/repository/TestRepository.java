package com.devhunter.ingest.repository;

import com.devhunter.ingest.domain.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestRepository extends JpaRepository<Test, UUID> {

    Optional<Test> findByExternalId(String externalId);

    @Query(value = """
        SELECT t.*, ts_rank(t.document_tsv, to_tsquery('english', :query)) as rank
        FROM tests t
        WHERE t.document_tsv @@ to_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<Test> searchByFullText(
        @Param("query") String query,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM tests t
        WHERE t.document_tsv @@ to_tsquery('english', :query)
        """, nativeQuery = true)
    long countByFullText(@Param("query") String query);
}

