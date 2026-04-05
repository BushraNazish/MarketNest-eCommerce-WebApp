package com.markethub.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CommissionResponseDto {
    private String orderNumber;
    private String subOrderNumber;
    private String vendorName;
    private String products; // Comma separated list of Product names
    private BigDecimal orderTotal;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private LocalDateTime date;
}
