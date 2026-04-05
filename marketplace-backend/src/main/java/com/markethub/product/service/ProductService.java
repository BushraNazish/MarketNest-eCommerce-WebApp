package com.markethub.product.service;

import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import com.markethub.product.dto.ProductDto;
import com.markethub.product.entity.Category;
import com.markethub.product.entity.Product;
import com.markethub.product.entity.ProductImage;
import com.markethub.product.entity.ProductStatus;
import com.markethub.product.repository.CategoryRepository;
import com.markethub.product.repository.ProductRepository;
import com.markethub.vendor.entity.Vendor;
import com.markethub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductDto.Response createProduct(ProductDto.CreateRequest request) {
        User user = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        if (request.getCategoryId() == null) {
            throw new RuntimeException("Category is required");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        String slug = generateSlug(request.getName(), vendor.getId());

        Product product = Product.builder()
                .vendor(vendor)
                .category(category)
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .status(ProductStatus.ACTIVE) // Default to ACTIVE for testing Search
                .build();

        // Add Images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .imageUrl(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .isPrimary(i == 0)
                        .build();
                product.addImage(image);
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto.Response> getMyProducts(Pageable pageable) {
        User user = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

        return productRepository.findByVendorId(vendor.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductDto.Response> getVendorProducts(UUID vendorId, Pageable pageable) {
        return productRepository.findByVendorId(vendorId, pageable)
                .map(this::mapToResponse);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private String generateSlug(String name, UUID vendorId) {
        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        // We might want to append a random string or vendor-prefix to ensure uniqueness globally
        String slug = baseSlug + "-" + System.currentTimeMillis(); 
        // Simple strategy for now: baseSlug + timestamp. 
        // Ideally should check DB existence and increment counter.
        return slug;
    }

    @Transactional(readOnly = true)
    public Page<ProductDto.Response> searchProducts(com.markethub.product.dto.ProductSearchRequest request) {
        // Create Pageable with sort
        String sortField = "createdAt";
        org.springframework.data.domain.Sort.Direction direction = org.springframework.data.domain.Sort.Direction.DESC;

        if (request.getSort() != null) {
            switch (request.getSort()) {
                case "price_asc":
                    sortField = "salePrice";
                    direction = org.springframework.data.domain.Sort.Direction.ASC;
                    break;
                case "price_desc":
                    sortField = "salePrice";
                    direction = org.springframework.data.domain.Sort.Direction.DESC;
                    break;
                case "newest":
                default:
                    sortField = "createdAt";
                    direction = org.springframework.data.domain.Sort.Direction.DESC;
                    break;
            }
        }

        Pageable pageable = org.springframework.data.domain.PageRequest.of(request.getPage(), request.getSize(), org.springframework.data.domain.Sort.by(direction, sortField));
        
        org.springframework.data.jpa.domain.Specification<Product> spec = com.markethub.product.repository.ProductSpecification.getProducts(request);
        
        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ProductDto.Response getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductDto.Response getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    private ProductDto.Response mapToResponse(Product product) {
        return ProductDto.Response.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .status(product.getStatus())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .vendorId(product.getVendor().getId())
                .vendorName(product.getVendor().getStoreName())
                .images(product.getImages().stream().map(img -> ProductDto.ImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.isPrimary())
                        .build()).collect(Collectors.toList()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
