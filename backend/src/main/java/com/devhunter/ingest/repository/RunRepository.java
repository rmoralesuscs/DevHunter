package com.devhunter.ingest.repository;

import com.devhunter.ingest.domain.Run;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RunRepository extends JpaRepository<Run, UUID> {

    List<Run> findByTestId(UUID testId);

    @Query(value = """
        SELECT r.*, ts_rank(r.document_tsv, to_tsquery('english', :query)) as rank
        FROM runs r
        WHERE r.document_tsv @@ to_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<Run> searchByFullText(
        @Param("query") String query,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM runs r
        WHERE r.document_tsv @@ to_tsquery('english', :query)
        """, nativeQuery = true)
    long countByFullText(@Param("query") String query);
}

