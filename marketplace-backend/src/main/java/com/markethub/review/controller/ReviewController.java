package com.markethub.review.controller;

import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import com.markethub.review.dto.*;
import com.markethub.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- Product Reviews ---

    @PostMapping("/products")
    public ResponseEntity<ReviewResponse> submitProductReview(
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitProductReview(getCurrentUser(), request));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, pageable));
    }

    @PutMapping("/products/{reviewId}")
    public ResponseEntity<ReviewResponse> updateProductReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateProductReview(getCurrentUser(), reviewId, request));
    }

    @DeleteMapping("/products/{reviewId}")
    public ResponseEntity<Void> deleteProductReview(
            @PathVariable UUID reviewId) {
        reviewService.deleteProductReview(getCurrentUser(), reviewId);
        return ResponseEntity.noContent().build();
    }

    // --- Review Voting & Reporting ---

    @PostMapping("/{reviewId}/vote")
    public ResponseEntity<Void> voteOnReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewVoteRequest request) {
        reviewService.voteOnReview(getCurrentUser(), reviewId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{reviewId}/report")
    public ResponseEntity<Void> reportReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReportRequest request) {
        reviewService.reportReview(getCurrentUser(), reviewId, request);
        return ResponseEntity.ok().build();
    }

    // --- Seller Reviews ---

    @PostMapping("/sellers")
    public ResponseEntity<SellerReviewResponse> submitSellerReview(
            @Valid @RequestBody SellerReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitSellerReview(getCurrentUser(), request));
    }

    @GetMapping("/sellers/{vendorId}")
    public ResponseEntity<Page<SellerReviewResponse>> getSellerReviews(
            @PathVariable UUID vendorId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getSellerReviews(vendorId, pageable));
    }

    @GetMapping("/sellers/me")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<SellerReviewResponse>> getMySellerReviews(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getMySellerReviews(getCurrentUser(), pageable));
    }

    // --- Moderation (Admin) ---

    @GetMapping("/pending")
    public ResponseEntity<Page<ReviewResponse>> getPendingReviews(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getPendingReviews(pageable));
    }

    @PostMapping("/{reviewId}/moderate")
    public ResponseEntity<Void> moderateReview(
            @PathVariable UUID reviewId,
            @RequestParam String action,
            @RequestParam(required = false) String notes) {
        // Validation for Admin role should be handled via method security or in the controller/service
        reviewService.moderateReview(getCurrentUser().getId(), reviewId, action, notes);
        return ResponseEntity.ok().build();
    }
}
