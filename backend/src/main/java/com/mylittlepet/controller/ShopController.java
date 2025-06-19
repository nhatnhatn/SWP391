package com.mylittlepet.controller;

import com.mylittlepet.dto.ShopDTO;
import com.mylittlepet.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class ShopController {

    @Autowired
    private ShopService shopService;

    // GET /api/shops - Get all shops
    @GetMapping
    public ResponseEntity<List<ShopDTO>> getAllShops() {
        try {
            List<ShopDTO> shops = shopService.getAllShops();
            return ResponseEntity.ok(shops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shops/{id} - Get shop by ID
    @GetMapping("/{id}")
    public ResponseEntity<ShopDTO> getShopById(@PathVariable Integer id) {
        try {
            Optional<ShopDTO> shop = shopService.getShopById(id);
            if (shop.isPresent()) {
                return ResponseEntity.ok(shop.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shops/type/{type} - Get shops by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ShopDTO>> getShopsByType(@PathVariable String type) {
        try {
            List<ShopDTO> shops = shopService.getShopsByType(type);
            return ResponseEntity.ok(shops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shops/search?keyword= - Search shops
    @GetMapping("/search")
    public ResponseEntity<List<ShopDTO>> searchShops(@RequestParam String keyword) {
        try {
            List<ShopDTO> shops = shopService.searchShops(keyword);
            return ResponseEntity.ok(shops);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/shops - Create new shop
    @PostMapping
    public ResponseEntity<ShopDTO> createShop(@RequestBody ShopDTO shopDTO) {
        try {
            ShopDTO createdShop = shopService.createShop(shopDTO);
            return ResponseEntity.ok(createdShop);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // PUT /api/shops/{id} - Update shop
    @PutMapping("/{id}")
    public ResponseEntity<ShopDTO> updateShop(@PathVariable Integer id, @RequestBody ShopDTO shopDTO) {
        try {
            ShopDTO updatedShop = shopService.updateShop(id, shopDTO);
            if (updatedShop != null) {
                return ResponseEntity.ok(updatedShop);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // DELETE /api/shops/{id} - Delete shop
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShop(@PathVariable Integer id) {
        try {
            boolean deleted = shopService.deleteShop(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/shops/test - Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Shop Management API is working!");
    }
}
