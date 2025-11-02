package com.devhunter.ingest.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobProperties;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "azure")
public class AzureStorageProvider implements StorageProvider {

    private final BlobServiceClient blobServiceClient;
    private final String containerName;
    private final int sasExpirySeconds = 3600; // 1 hour

    public AzureStorageProvider(
            @Value("${app.storage.azure.connection-string}") String connectionString,
            @Value("${app.storage.azure.container-name}") String containerName) {
        this.containerName = containerName;
        this.blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();

        // Ensure container exists
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.create();
            log.info("Created Azure Blob container: {}", containerName);
        }
    }

    @Override
    public PresignedUploadInfo generatePresignedUpload(String filename, String contentType, long sizeBytes) {
        String objectKey = generateObjectKey(filename);
        String presignedId = UUID.randomUUID().toString();

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(objectKey);

        // Create SAS token for upload
        BlobSasPermission permissions = new BlobSasPermission()
                .setWritePermission(true)
                .setCreatePermission(true);

        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(
                OffsetDateTime.now().plusSeconds(sasExpirySeconds),
                permissions
        ).setContentType(contentType);

        String sasToken = blobClient.generateSas(sasValues);
        String uploadUrl = blobClient.getBlobUrl() + "?" + sasToken;

        Map<String, String> headers = new HashMap<>();
        headers.put("x-ms-blob-type", "BlockBlob");
        headers.put("Content-Type", contentType);

        return PresignedUploadInfo.builder()
                .presignedId(presignedId)
                .uploadUrl(uploadUrl)
                .provider("azure")
                .headers(headers)
                .expiresInSeconds(sasExpirySeconds)
                .objectKey(objectKey)
                .build();
    }

    @Override
    public String finalizeUpload(String presignedId, String objectKey, long expectedSize, String expectedSha256) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(objectKey);

        if (!blobClient.exists()) {
            throw new IllegalStateException("Blob does not exist: " + objectKey);
        }

        BlobProperties properties = blobClient.getProperties();

        // Verify size
        if (properties.getBlobSize() != expectedSize) {
            throw new IllegalArgumentException(
                    String.format("Size mismatch: expected %d, got %d", expectedSize, properties.getBlobSize())
            );
        }

        // Note: Azure doesn't automatically calculate SHA256, would need custom implementation
        // For now, we trust the client-provided hash
        log.info("Finalized Azure blob: {} (size: {})", objectKey, expectedSize);

        return blobClient.getBlobUrl();
    }

    @Override
    public String getProviderName() {
        return "azure";
    }

    @Override
    public boolean isAvailable() {
        try {
            blobServiceClient.getBlobContainerClient(containerName).exists();
            return true;
        } catch (Exception e) {
            log.error("Azure storage not available", e);
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

