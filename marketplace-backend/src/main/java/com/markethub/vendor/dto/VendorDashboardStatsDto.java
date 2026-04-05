package com.markethub.vendor.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class VendorDashboardStatsDto {
    private BigDecimal totalSales;
    private long totalOrders;
    private long totalProducts;
}
