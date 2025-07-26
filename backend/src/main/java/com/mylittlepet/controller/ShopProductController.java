package com.mylittlepet.controller;

import com.mylittlepet.dto.ShopProductDTO;
import com.mylittlepet.service.ShopProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shop-products")

@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ShopProductController {

    @Autowired
    private ShopProductService shopProductService;

    // GET /api/shop-products - Get all shop products
    @GetMapping
    public ResponseEntity<List<ShopProductDTO>> getAllShopProducts() {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getAllShopProducts();
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/{id} - Get shop product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ShopProductDTO> getShopProductById(@PathVariable Integer id) {
        try {
            Optional<ShopProductDTO> shopProduct = shopProductService.getShopProductById(id);
            if (shopProduct.isPresent()) {
                return ResponseEntity.ok(shopProduct.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/shop/{shopId} - Get shop products by shop ID
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByShopId(@PathVariable Integer shopId) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByShopId(shopId);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/pet/{petId} - Get shop products by pet ID
    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByPetId(@PathVariable Integer petId) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByPetId(petId);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/type/{type} - Get shop products by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByType(@PathVariable String type) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByType(type);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/shop-products - Create new shop product
    @PostMapping
    public ResponseEntity<ShopProductDTO> createShopProduct(@RequestBody ShopProductDTO shopProductDTO) {
        try {
            ShopProductDTO createdProduct = shopProductService.createShopProduct(shopProductDTO);
            return ResponseEntity.ok(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/shop-products/{id} - Update shop product
    @PutMapping("/{id}")
    public ResponseEntity<ShopProductDTO> updateShopProduct(@PathVariable Integer id,
            @RequestBody ShopProductDTO shopProductDTO) {
        try {
            ShopProductDTO updatedProduct = shopProductService.updateShopProduct(id, shopProductDTO);
            if (updatedProduct != null) {
                return ResponseEntity.ok(updatedProduct);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
