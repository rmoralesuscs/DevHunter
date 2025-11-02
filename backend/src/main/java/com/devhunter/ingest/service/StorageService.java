package com.devhunter.ingest.service;

import com.devhunter.ingest.dto.ArtifactResponse;
import com.devhunter.ingest.dto.FinalizeRequest;
import com.devhunter.ingest.dto.PresignRequest;
import com.devhunter.ingest.dto.PresignResponse;
import com.devhunter.ingest.storage.PresignedUploadInfo;
import com.devhunter.ingest.storage.StorageProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final List<StorageProvider> storageProviders;

    @Value("${app.limits.default-max-bytes}")
    private long defaultMaxBytes;

    @Value("${app.limits.mp4-max-bytes}")
    private long mp4MaxBytes;

    @Value("${app.limits.mp4-enabled}")
    private boolean mp4Enabled;

    private final Map<String, PresignedUploadInfo> presignCache = new ConcurrentHashMap<>();

    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/json",
            "application/octet-stream",
            "application/zip",
            "image/png",
            "image/jpeg",
            "audio/mpeg",
            "audio/wav"
    );

    public PresignResponse generatePresignedUpload(PresignRequest request) {
        validateRequest(request);

        StorageProvider provider = getAvailableProvider();

        PresignedUploadInfo info = provider.generatePresignedUpload(
                request.getFilename(),
                request.getContentType(),
                request.getSizeBytes()
        );

        // Cache for finalization
        presignCache.put(info.getPresignedId(), info);

        return PresignResponse.builder()
                .provider(info.getProvider())
                .uploadUrl(info.getUploadUrl())
                .fields(info.getHeaders())
                .expiresInSeconds(info.getExpiresInSeconds())
                .presignedId(info.getPresignedId())
                .build();
    }

    public ArtifactResponse finalizeUpload(FinalizeRequest request) {
        PresignedUploadInfo info = presignCache.get(request.getPresignedId());

        if (info == null) {
            throw new IllegalArgumentException("Invalid or expired presigned_id");
        }

        StorageProvider provider = getProviderByName(info.getProvider());

        String finalUrl = provider.finalizeUpload(
                request.getPresignedId(),
                info.getObjectKey(),
                request.getSizeBytes(),
                request.getSha256()
        );

        presignCache.remove(request.getPresignedId());

        return ArtifactResponse.builder()
                .url(finalUrl)
                .sizeBytes(request.getSizeBytes())
                .sha256(request.getSha256())
                .build();
    }

    private void validateRequest(PresignRequest request) {
        String contentType = request.getContentType().toLowerCase();

        // Check MP4
        if (contentType.equals("video/mp4")) {
            if (!mp4Enabled) {
                throw new IllegalArgumentException("MP4 uploads are not enabled (feature flag required)");
            }
            if (request.getSizeBytes() > mp4MaxBytes) {
                throw new IllegalArgumentException(
                        String.format("MP4 file too large: max %d bytes", mp4MaxBytes)
                );
            }
        } else {
            // Check standard limits
            if (request.getSizeBytes() > defaultMaxBytes) {
                throw new IllegalArgumentException(
                        String.format("File too large: max %d bytes", defaultMaxBytes)
                );
            }

            // Check MIME type
            boolean allowed = ALLOWED_MIME_TYPES.stream()
                    .anyMatch(mime -> contentType.startsWith(mime.replace("*", "")));

            if (!allowed) {
                throw new IllegalArgumentException("Unsupported content type: " + contentType);
            }
        }
    }

    private StorageProvider getAvailableProvider() {
        return storageProviders.stream()
                .filter(StorageProvider::isAvailable)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No storage provider available"));
    }

    private StorageProvider getProviderByName(String name) {
        return storageProviders.stream()
                .filter(p -> p.getProviderName().equals(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown provider: " + name));
    }
}

