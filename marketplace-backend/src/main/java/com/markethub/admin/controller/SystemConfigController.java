package com.markethub.admin.controller;

import com.markethub.admin.dto.SystemConfigDto;
import com.markethub.admin.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/config")
@RequiredArgsConstructor
@Tag(name = "System Configuration", description = "Admin System Configuration API endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class SystemConfigController {

    private final SystemConfigService systemConfigService;

    @Operation(summary = "Get all system configurations")
    @GetMapping
    public ResponseEntity<List<SystemConfigDto.Response>> getAllConfigs() {
        return ResponseEntity.ok(systemConfigService.getAllConfigs());
    }

    @Operation(summary = "Get system configuration by key")
    @GetMapping("/{key}")
    public ResponseEntity<SystemConfigDto.Response> getConfigByKey(@PathVariable String key) {
        return ResponseEntity.ok(systemConfigService.getConfigByKey(key));
    }

    @Operation(summary = "Create or update system configuration")
    @PutMapping("/{key}")
    public ResponseEntity<SystemConfigDto.Response> upsertConfig(
            @PathVariable String key, 
            @Valid @RequestBody SystemConfigDto.UpsertRequest request) {
        return ResponseEntity.ok(systemConfigService.upsertConfig(key, request));
    }
}
