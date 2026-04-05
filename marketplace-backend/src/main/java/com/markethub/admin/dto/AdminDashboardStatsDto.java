package com.markethub.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AdminDashboardStatsDto {
    private BigDecimal totalSales;
    private long totalOrders;
    private long totalCustomers;
    private long activeVendors;
    private long totalProducts;
    private BigDecimal totalCommission;
}
