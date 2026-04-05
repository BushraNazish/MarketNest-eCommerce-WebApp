package com.markethub.cart.entity;

import com.markethub.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
        calculateTotal();
    }
    
    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
        calculateTotal();
    }
    
    public void calculateTotal() {
        this.totalAmount = items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
