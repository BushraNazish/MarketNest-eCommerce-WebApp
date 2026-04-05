package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.markethub.order.enums.ReturnStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReturnRequestResponse {
    private UUID id;
    
    @JsonProperty("return_number")
    private String returnNumber;
    
    @JsonProperty("order_number")
    private String orderNumber;
    
    @JsonProperty("sub_order_number")
    private String subOrderNumber;
    
    private String items;
    private String reason;
    
    @JsonProperty("reason_details")
    private String reasonDetails;
    
    private ReturnStatus status;
    
    @JsonProperty("admin_notes")
    private String adminNotes;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
