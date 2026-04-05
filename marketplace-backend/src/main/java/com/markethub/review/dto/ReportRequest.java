package com.markethub.review.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

    private String details;

}
