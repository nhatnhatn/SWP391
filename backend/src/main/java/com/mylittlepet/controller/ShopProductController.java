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

    // GET /api/shop-products/status/{status} - Get shop products by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByStatus(@PathVariable Integer status) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByStatus(status);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/currency/{currencyType} - Get shop products by
    // currency type
    @GetMapping("/currency/{currencyType}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByCurrencyType(@PathVariable String currencyType) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByCurrencyType(currencyType);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/admin/{adminId} - Get shop products by admin ID
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByAdminId(@PathVariable Integer adminId) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByAdminId(adminId);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/price-range?min=&max= - Get shop products by price
    // range
    @GetMapping("/price-range")
    public ResponseEntity<List<ShopProductDTO>> getShopProductsByPriceRange(
            @RequestParam Integer min, @RequestParam Integer max) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getShopProductsByPriceRange(min, max);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/search?keyword= - Search shop products
    @GetMapping("/search")
    public ResponseEntity<List<ShopProductDTO>> searchShopProducts(@RequestParam String keyword) {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.searchShopProducts(keyword);
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/active - Get active shop products
    @GetMapping("/active")
    public ResponseEntity<List<ShopProductDTO>> getActiveShopProducts() {
        try {
            List<ShopProductDTO> shopProducts = shopProductService.getActiveShopProducts();
            return ResponseEntity.ok(shopProducts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/shop-products - Create new shop product
    @PostMapping
    public ResponseEntity<ShopProductDTO> createShopProduct(@RequestBody ShopProductDTO shopProductDTO) {
        try {
            ShopProductDTO createdShopProduct = shopProductService.createShopProduct(shopProductDTO);
            return ResponseEntity.ok(createdShopProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/shop-products/{id} - Update shop product
    @PutMapping("/{id}")
    public ResponseEntity<ShopProductDTO> updateShopProduct(@PathVariable Integer id,
            @RequestBody ShopProductDTO shopProductDTO) {
        try {
            ShopProductDTO updatedShopProduct = shopProductService.updateShopProduct(id, shopProductDTO);
            if (updatedShopProduct != null) {
                return ResponseEntity.ok(updatedShopProduct);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // DELETE /api/shop-products/{id} - Delete shop product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShopProduct(@PathVariable Integer id) {
        try {
            boolean deleted = shopProductService.deleteShopProduct(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PATCH /api/shop-products/{id}/status - Update shop product status
    @PatchMapping("/{id}/status")
    public ResponseEntity<ShopProductDTO> updateShopProductStatus(@PathVariable Integer id,
            @RequestParam Integer status) {
        try {
            ShopProductDTO updatedShopProduct = shopProductService.updateShopProductStatus(id, status);
            if (updatedShopProduct != null) {
                return ResponseEntity.ok(updatedShopProduct);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shop-products/test - Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Shop Product Management API is working!");
    }
}