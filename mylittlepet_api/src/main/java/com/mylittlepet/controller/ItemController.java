package com.mylittlepet.controller;

import com.mylittlepet.dto.ItemDTO;
import com.mylittlepet.entity.Item;
import com.mylittlepet.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping
    public ResponseEntity<List<ItemDTO>> getAllItems() {
        try {
            List<ItemDTO> items = itemService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<ItemDTO>> getAllItemsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ItemDTO> items = itemService.getAllItemsWithPagination(pageable);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable Long id) {
        try {
            Optional<ItemDTO> item = itemService.getItemById(id);
            return item.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ItemDTO>> getItemsByType(@PathVariable Item.ItemType type) {
        try {
            List<ItemDTO> items = itemService.getItemsByType(type);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<ItemDTO>> getItemsByRarity(@PathVariable Item.RarityType rarity) {
        try {
            List<ItemDTO> items = itemService.getItemsByRarity(rarity);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemDTO>> searchItems(@RequestParam String keyword) {
        try {
            List<ItemDTO> items = itemService.searchItems(keyword);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/shop")
    public ResponseEntity<List<ItemDTO>> getShopItems() {
        try {
            List<ItemDTO> items = itemService.getShopItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/inventory/{userId}")
    public ResponseEntity<List<ItemDTO>> getUserInventory(@PathVariable Long userId) {
        try {
            List<ItemDTO> items = itemService.getUserInventory(userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createItem(@Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO createdItem = itemService.createItem(itemDTO);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO updatedItem = itemService.updateItem(id, itemDTO);
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.ok(new SuccessResponse("Xóa vật phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{itemId}/purchase")
    public ResponseEntity<?> purchaseItem(@PathVariable Long itemId,
            @RequestParam Long userId,
            @RequestParam(required = false) Integer quantity) {
        try {
            ItemDTO item = itemService.purchaseItem(userId, itemId, quantity);
            return ResponseEntity.ok(new PurchaseResponse("Mua vật phẩm thành công", item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{itemId}/sell")
    public ResponseEntity<?> sellItem(@PathVariable Long itemId,
            @RequestParam Long userId,
            @RequestParam(required = false) Integer quantity) {
        try {
            ItemDTO item = itemService.sellItem(userId, itemId, quantity);
            return ResponseEntity.ok(new SellResponse("Bán vật phẩm thành công", item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{itemId}/use")
    public ResponseEntity<?> useItem(@PathVariable Long itemId, @RequestParam Long userId) {
        try {
            itemService.useItem(userId, itemId);
            return ResponseEntity.ok(new SuccessResponse("Sử dụng vật phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Response classes
    public static class ErrorResponse {
        private String message;
        private String status = "error";

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class SuccessResponse {
        private String message;
        private String status = "success";

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class PurchaseResponse {
        private String message;
        private String status = "success";
        private ItemDTO item;

        public PurchaseResponse(String message, ItemDTO item) {
            this.message = message;
            this.item = item;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public ItemDTO getItem() {
            return item;
        }

        public void setItem(ItemDTO item) {
            this.item = item;
        }
    }

    public static class SellResponse {
        private String message;
        private String status = "success";
        private ItemDTO item;

        public SellResponse(String message, ItemDTO item) {
            this.message = message;
            this.item = item;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public ItemDTO getItem() {
            return item;
        }

        public void setItem(ItemDTO item) {
            this.item = item;
        }
    }
}
