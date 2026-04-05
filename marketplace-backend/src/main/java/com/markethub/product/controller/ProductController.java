package com.markethub.product.controller;

import com.markethub.product.dto.ProductDto;
import com.markethub.product.service.ProductService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ProductDto.Response> createProduct(@RequestBody ProductDto.CreateRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto.Response> getProductById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }


    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductDto.Response> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/vendor/my-products")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<ProductDto.Response>> getMyProducts(Pageable pageable) {
        return ResponseEntity.ok(productService.getMyProducts(pageable));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<Page<ProductDto.Response>> getProductsByVendor(@PathVariable java.util.UUID vendorId, Pageable pageable) {
        return ResponseEntity.ok(productService.getVendorProducts(vendorId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto.Response>> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) java.util.UUID categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        com.markethub.product.dto.ProductSearchRequest request = new com.markethub.product.dto.ProductSearchRequest();
        request.setQuery(q);
        request.setCategoryId(categoryId);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setSort(sort);
        request.setPage(page);
        request.setSize(size);
        
        return ResponseEntity.ok(productService.searchProducts(request));
    }
}
