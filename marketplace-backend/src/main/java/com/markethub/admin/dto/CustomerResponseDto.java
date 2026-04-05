package com.markethub.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponseDto {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private LocalDateTime registeredAt;
}
