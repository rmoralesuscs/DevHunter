package com.devhunter.ingest.storage;

public interface StorageProvider {

    /**
     * Generate a presigned URL for uploading a file
     */
    PresignedUploadInfo generatePresignedUpload(String filename, String contentType, long sizeBytes);

    /**
     * Verify and finalize an uploaded artifact
     */
    String finalizeUpload(String presignedId, String objectKey, long expectedSize, String expectedSha256);

    /**
     * Get the provider name (azure, aws, gcs)
     */
    String getProviderName();

    /**
     * Check if this provider is configured and available
     */
    boolean isAvailable();
}

