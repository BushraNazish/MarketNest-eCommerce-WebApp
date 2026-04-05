package com.markethub.product.repository;

import com.markethub.product.dto.ProductSearchRequest;
import com.markethub.product.entity.Product;
import com.markethub.product.entity.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> getProducts(ProductSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status is always ACTIVE for public search
            predicates.add(criteriaBuilder.equal(root.get("status"), ProductStatus.ACTIVE));

            if (StringUtils.hasText(request.getQuery())) {
                String likePattern = "%" + request.getQuery().toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                // Join Category to search category name
                Predicate categoryLike = criteriaBuilder.like(criteriaBuilder.lower(root.join("category").get("name")), likePattern);
                predicates.add(criteriaBuilder.or(nameLike, descLike, categoryLike));
            }

            if (request.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            if (request.getMinPrice() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("salePrice"), request.getMinPrice()));
            }

            if (request.getMaxPrice() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("salePrice"), request.getMaxPrice()));
            }
            
            // Note: Sorting is handled by Pageable in the service/controller, not here usually, 
            // but we can add order here if we weren't using Pageable sort.
            // We'll trust the Pageable passed to the repository for sorting.

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
