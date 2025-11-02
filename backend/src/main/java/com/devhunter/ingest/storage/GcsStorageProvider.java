package com.devhunter.ingest.storage;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "gcs")
public class GcsStorageProvider implements StorageProvider {

    private final Storage storage;
    private final String bucketName;
    private final int presignExpirySeconds = 3600; // 1 hour

    public GcsStorageProvider(
            @Value("${app.storage.gcs.project-id}") String projectId,
            @Value("${app.storage.gcs.bucket-name}") String bucketName,
            @Value("${app.storage.gcs.credentials-path:#{null}}") String credentialsPath) throws Exception {
        this.bucketName = bucketName;

        StorageOptions.Builder builder = StorageOptions.newBuilder().setProjectId(projectId);

        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(credentialsPath));
            builder.setCredentials(credentials);
        }

        this.storage = builder.build().getService();
        log.info("Initialized GCS storage provider for bucket: {}", bucketName);
    }

    @Override
    public PresignedUploadInfo generatePresignedUpload(String filename, String contentType, long sizeBytes) {
        String objectKey = generateObjectKey(filename);
        String presignedId = UUID.randomUUID().toString();

        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectKey))
                .setContentType(contentType)
                .build();

        // Generate V4 signed URL
        java.net.URL signedUrl = storage.signUrl(
                blobInfo,
                presignExpirySeconds,
                TimeUnit.SECONDS,
                Storage.SignUrlOption.httpMethod(com.google.cloud.storage.HttpMethod.PUT),
                Storage.SignUrlOption.withV4Signature()
        );

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);

        return PresignedUploadInfo.builder()
                .presignedId(presignedId)
                .uploadUrl(signedUrl.toString())
                .provider("gcs")
                .headers(headers)
                .expiresInSeconds(presignExpirySeconds)
                .objectKey(objectKey)
                .build();
    }

    @Override
    public String finalizeUpload(String presignedId, String objectKey, long expectedSize, String expectedSha256) {
        BlobId blobId = BlobId.of(bucketName, objectKey);
        Blob blob = storage.get(blobId);

        if (blob == null) {
            throw new IllegalStateException("Blob does not exist: " + objectKey);
        }

        // Verify size
        if (blob.getSize() != expectedSize) {
            throw new IllegalArgumentException(
                    String.format("Size mismatch: expected %d, got %d", expectedSize, blob.getSize())
            );
        }

        log.info("Finalized GCS object: {} (size: {})", objectKey, expectedSize);

        return String.format("gs://%s/%s", bucketName, objectKey);
    }

    @Override
    public String getProviderName() {
        return "gcs";
    }

    @Override
    public boolean isAvailable() {
        try {
            storage.get(bucketName);
            return true;
        } catch (Exception e) {
            log.error("GCS not available", e);
            return false;
        }
    }

    private String generateObjectKey(String filename) {
        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return String.format("uploads/%s/%s",
                OffsetDateTime.now().toLocalDate(),
                UUID.randomUUID() + "_" + sanitized);
    }
}

