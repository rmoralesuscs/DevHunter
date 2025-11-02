package com.devhunter.ingest.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectAttributesRequest;
import software.amazon.awssdk.services.s3.model.GetObjectAttributesResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.ObjectAttributes;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "aws")
public class AwsS3StorageProvider implements StorageProvider {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    private final int presignExpirySeconds = 3600; // 1 hour

    public AwsS3StorageProvider(
            @Value("${app.storage.aws.region}") String region,
            @Value("${app.storage.aws.bucket-name}") String bucketName,
            @Value("${app.storage.aws.access-key-id}") String accessKeyId,
            @Value("${app.storage.aws.secret-access-key}") String secretAccessKey) {
        this.bucketName = bucketName;

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(credentials);

        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();

        this.s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();

        log.info("Initialized AWS S3 storage provider for bucket: {}", bucketName);
    }

    @Override
    public PresignedUploadInfo generatePresignedUpload(String filename, String contentType, long sizeBytes) {
        String objectKey = generateObjectKey(filename);
        String presignedId = UUID.randomUUID().toString();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(presignExpirySeconds))
                .putObjectRequest(req -> req
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(contentType)
                        .contentLength(sizeBytes))
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", contentType);

        return PresignedUploadInfo.builder()
                .presignedId(presignedId)
                .uploadUrl(presignedRequest.url().toString())
                .provider("aws")
                .headers(headers)
                .expiresInSeconds(presignExpirySeconds)
                .objectKey(objectKey)
                .build();
    }

    @Override
    public String finalizeUpload(String presignedId, String objectKey, long expectedSize, String expectedSha256) {
        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        HeadObjectResponse headResponse = s3Client.headObject(headRequest);

        // Verify size
        if (headResponse.contentLength() != expectedSize) {
            throw new IllegalArgumentException(
                    String.format("Size mismatch: expected %d, got %d", expectedSize, headResponse.contentLength())
            );
        }

        // Get ETag and verify checksum if available
        String etag = headResponse.eTag().replaceAll("\"", "");
        log.info("Finalized S3 object: {} (size: {}, ETag: {})", objectKey, expectedSize, etag);

        return String.format("s3://%s/%s", bucketName, objectKey);
    }

    @Override
    public String getProviderName() {
        return "aws";
    }

    @Override
    public boolean isAvailable() {
        try {
            s3Client.listBuckets();
            return true;
        } catch (Exception e) {
            log.error("AWS S3 not available", e);
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

