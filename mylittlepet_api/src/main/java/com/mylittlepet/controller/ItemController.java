package com.mylittlepet.controller;

import com.mylittlepet.dto.ItemDTO;
import com.mylittlepet.entity.Item;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Items", description = "Item management and shop operations for Vietnamese Pet System")
@SecurityRequirement(name = "Bearer Authentication")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Operation(
        summary = "Get all items",
        description = "Retrieve all items including Food (🍞), Medicine (💊), Toy (🧸), and Accessory items"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Items retrieved successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "400", description = "Bad request")
    })
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
        }    }

    @Operation(
        summary = "Get item by ID",
        description = "Retrieve a specific item by its unique identifier"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item found successfully"),
        @ApiResponse(responseCode = "404", description = "Item not found"),
        @ApiResponse(responseCode = "400", description = "Invalid item ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable Long id) {
        try {
            Optional<ItemDTO> item = itemService.getItemById(id);
            return item.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get items by type",
        description = "Retrieve all items of a specific type (FOOD, TOY, MEDICINE, ACCESSORY, etc.)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Items retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid item type")
    })
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ItemDTO>> getItemsByType(@PathVariable Item.ItemType type) {
        try {
            List<ItemDTO> items = itemService.getItemsByType(type);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Get items by rarity",
        description = "Retrieve all items of a specific rarity level (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Items retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid rarity type")
    })
    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<ItemDTO>> getItemsByRarity(@PathVariable Pet.RarityType rarity) {
        try {
            List<ItemDTO> items = itemService.getItemsByRarity(rarity);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Search items",
        description = "Search items by keyword (name or description)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
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
        }    }

    @Operation(
        summary = "Get user inventory",
        description = "Retrieve all items in a specific user's inventory"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User inventory retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user ID")
    })
    @GetMapping("/inventory/{userId}")
    public ResponseEntity<List<ItemDTO>> getUserInventory(@PathVariable Long userId) {
        try {
            List<ItemDTO> items = itemService.getUserInventory(userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }    }

    @Operation(
        summary = "Create new item",
        description = "Create a new item for the Vietnamese Pet Shop System"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid item data")
    })
    @PostMapping
    public ResponseEntity<?> createItem(@Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO createdItem = itemService.createItem(itemDTO);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Update item",
        description = "Update an existing item's information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid item data"),
        @ApiResponse(responseCode = "404", description = "Item not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO updatedItem = itemService.updateItem(id, itemDTO);
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }    }

    @Operation(
        summary = "Delete item",
        description = "Remove an item from the system permanently"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Cannot delete item"),
        @ApiResponse(responseCode = "404", description = "Item not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteItem(id);
            return ResponseEntity.ok(new SuccessResponse("Xóa vật phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }    @Operation(
        summary = "Purchase item",
        description = "Buy an item from the Vietnamese Pet Shop using coins"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item purchased successfully",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "400", description = "Purchase failed - insufficient coins or invalid item")
    })
    @PostMapping("/{itemId}/purchase")
    public ResponseEntity<?> purchaseItem(
            @Parameter(description = "Item ID to purchase", required = true)
            @PathVariable Long itemId,
            @Parameter(description = "User ID making the purchase", required = true)
            @RequestParam Long userId,
            @Parameter(description = "Quantity to purchase", example = "1")
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
