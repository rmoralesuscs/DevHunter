package com.devhunter.ingest.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "artifacts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id")
    private Run run;

    private String filename;

    private String url;

    private String provider;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    private String sha256;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

