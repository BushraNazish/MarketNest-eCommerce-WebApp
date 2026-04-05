package com.markethub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@io.swagger.v3.oas.annotations.OpenAPIDefinition(
    info = @io.swagger.v3.oas.annotations.info.Info(
        title = "MarketNest eCommerce API",
        version = "1.0",
        description = "API documentation for the MarketNest eCommerce platform."
    )
)
public class MarketplaceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketplaceBackendApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner initData(com.markethub.product.repository.CategoryRepository categoryRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                java.util.List<com.markethub.product.entity.Category> categories = java.util.List.of(
                        com.markethub.product.entity.Category.builder().name("Electronics").slug("electronics").categoryType(com.markethub.product.entity.CategoryType.ELECTRONICS).build(),
                        com.markethub.product.entity.Category.builder().name("Fashion").slug("fashion").categoryType(com.markethub.product.entity.CategoryType.FASHION).build(),
                        com.markethub.product.entity.Category.builder().name("Groceries").slug("groceries").categoryType(com.markethub.product.entity.CategoryType.GROCERIES).build()
                );
                categoryRepository.saveAll(categories);
            }
        };
    }
}
