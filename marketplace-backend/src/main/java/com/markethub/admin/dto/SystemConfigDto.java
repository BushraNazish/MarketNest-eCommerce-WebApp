package com.markethub.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

public class SystemConfigDto {

    @Data
    @Builder
    public static class Response {
        private String id;
        private String configKey;
        private String configValue;
        private String description;
        private String updatedAt;
        private String updatedBy;
    }

    @Data
    public static class UpsertRequest {
        @NotBlank(message = "Config key is required")
        private String configKey;

        @NotBlank(message = "Config value is required")
        private String configValue;

        private String description;
    }
}
