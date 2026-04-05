package com.markethub.admin.service;

import com.markethub.admin.dto.SystemConfigDto;
import com.markethub.admin.entity.SystemConfig;
import com.markethub.admin.repository.SystemConfigRepository;
import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SystemConfigDto.Response> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SystemConfigDto.Response getConfigByKey(String key) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Config not found"));
        return mapToResponse(config);
    }

    @Transactional
    public SystemConfigDto.Response upsertConfig(String key, SystemConfigDto.UpsertRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElse(SystemConfig.builder().configKey(key).build());

        config.setConfigValue(request.getConfigValue());
        
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        
        config.setUpdatedBy(user);
        
        SystemConfig saved = systemConfigRepository.save(config);
        return mapToResponse(saved);
    }

    private SystemConfigDto.Response mapToResponse(SystemConfig config) {
        return SystemConfigDto.Response.builder()
                .id(config.getId().toString())
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .description(config.getDescription())
                .updatedAt(config.getUpdatedAt() != null ? config.getUpdatedAt().toString() : null)
                .updatedBy(config.getUpdatedBy() != null ? config.getUpdatedBy().getEmail() : null)
                .build();
    }
}
