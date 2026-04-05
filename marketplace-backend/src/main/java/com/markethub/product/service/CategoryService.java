package com.markethub.product.service;

import com.markethub.product.dto.CategoryDto;
import com.markethub.product.entity.Category;
import com.markethub.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto.Response> getAllCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        return rootCategories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    // Recursive mapping
    private CategoryDto.Response mapToResponse(Category category) {
        List<CategoryDto.Response> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(category.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return CategoryDto.Response.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .iconName(category.getIconName())
                .categoryType(category.getCategoryType())
                .level(category.getLevel())
                .children(children)
                .build();
    }
}
