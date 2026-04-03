package com.markethub.vendor.controller;

import com.markethub.vendor.dto.VendorDto;
import com.markethub.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping("/shops")
    public ResponseEntity<VendorDto.Response> createShop(@RequestBody @Valid VendorDto.CreateRequest request) {
        return ResponseEntity.ok(vendorService.createShop(request));
    }

    @GetMapping("/shops/my-shop")
    public ResponseEntity<VendorDto.Response> getMyShop() {
        return ResponseEntity.ok(vendorService.getCurrentUserShop());
    }
}
