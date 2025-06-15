package com.mylittlepet.service;

import com.mylittlepet.dto.ItemDTO;
import com.mylittlepet.entity.Item;
import com.mylittlepet.entity.User;
import com.mylittlepet.entity.UserInventory;
import com.mylittlepet.repository.ItemRepository;
import com.mylittlepet.repository.UserRepository;
import com.mylittlepet.repository.UserInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserInventoryRepository userInventoryRepository;

    @Autowired
    private UserService userService;

    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<ItemDTO> getAllItemsWithPagination(Pageable pageable) {
        return itemRepository.findAll(pageable).map(this::convertToDTO);
    }

    public Optional<ItemDTO> getItemById(Long id) {
        return itemRepository.findById(id).map(this::convertToDTO);
    }

    public List<ItemDTO> getItemsByType(Item.ItemType type) {
        return itemRepository.findByType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getItemsByRarity(Item.RarityType rarity) {
        return itemRepository.findByRarity(rarity).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> searchItems(String keyword) {
        return itemRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getShopItems() {
        return itemRepository.findByIsInShopTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getUserInventory(Long userId) {
        List<UserInventory> inventory = userInventoryRepository.findByUserId(userId);
        return inventory.stream()
                .map(inv -> {
                    ItemDTO dto = convertToDTO(inv.getItem());
                    dto.setQuantity(inv.getQuantity());
                    dto.setObtainedAt(inv.getObtainedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ItemDTO createItem(ItemDTO itemDTO) {
        Item item = convertToEntity(itemDTO);
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());

        Item savedItem = itemRepository.save(item);
        return convertToDTO(savedItem);
    }

    public ItemDTO updateItem(Long id, ItemDTO itemDTO) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật phẩm"));

        // Update only non-null fields
        if (itemDTO.getName() != null) {
            existingItem.setName(itemDTO.getName());
        }

        if (itemDTO.getType() != null) {
            existingItem.setType(itemDTO.getType());
        }

        if (itemDTO.getRarity() != null) {
            existingItem.setRarity(itemDTO.getRarity());
        }

        if (itemDTO.getDescription() != null) {
            existingItem.setDescription(itemDTO.getDescription());
        }

        if (itemDTO.getImageUrl() != null) {
            existingItem.setImageUrl(itemDTO.getImageUrl());
        }
        if (itemDTO.getPrice() != null) {
            existingItem.setPrice(itemDTO.getPrice().intValue());
        }

        if (itemDTO.getSellPrice() != null) {
            existingItem.setSellPrice(itemDTO.getSellPrice().intValue());
        }

        if (itemDTO.getIsInShop() != null) {
            existingItem.setIsInShop(itemDTO.getIsInShop());
        }

        if (itemDTO.getStats() != null) {
            existingItem.setStats(itemDTO.getStats());
        }

        if (itemDTO.getEffects() != null) {
            existingItem.setEffects(itemDTO.getEffects());
        }

        existingItem.setUpdatedAt(LocalDateTime.now());
        Item savedItem = itemRepository.save(existingItem);
        return convertToDTO(savedItem);
    }

    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật phẩm"));

        itemRepository.delete(item);
    }

    public ItemDTO purchaseItem(Long userId, Long itemId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật phẩm"));

        if (!item.getIsInShop()) {
            throw new RuntimeException("Vật phẩm không có trong cửa hàng");
        }

        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }

        int totalCost = item.getPrice() * quantity;
        if (user.getCoins() < totalCost) {
            throw new RuntimeException("Không đủ xu để mua vật phẩm");
        }

        // Deduct coins from user
        userService.updateCoins(userId, -totalCost);

        // Add item to user inventory
        addItemToInventory(user, item, quantity);

        // Update user's item count
        int totalItems = userInventoryRepository.findByUserId(userId).stream()
                .mapToInt(UserInventory::getQuantity)
                .sum();
        userService.updateUserStats(userId, user.getTotalPets(), totalItems);

        // Add experience for purchasing
        userService.addExperience(userId, 5 * quantity);

        return convertToDTO(item);
    }

    public ItemDTO sellItem(Long userId, Long itemId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật phẩm"));

        UserInventory inventory = userInventoryRepository.findByUserIdAndItemId(userId, itemId)
                .orElseThrow(() -> new RuntimeException("Bạn không có vật phẩm này"));

        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Không đủ số lượng vật phẩm để bán");
        }

        int totalEarnings = item.getSellPrice() * quantity;

        // Add coins to user
        userService.updateCoins(userId, totalEarnings);

        // Remove item from inventory
        removeItemFromInventory(inventory, quantity);

        // Update user's item count
        int totalItems = userInventoryRepository.findByUserId(userId).stream()
                .mapToInt(UserInventory::getQuantity)
                .sum();
        userService.updateUserStats(userId, user.getTotalPets(), totalItems);

        return convertToDTO(item);
    }

    public void useItem(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vật phẩm"));

        UserInventory inventory = userInventoryRepository.findByUserIdAndItemId(userId, itemId)
                .orElseThrow(() -> new RuntimeException("Bạn không có vật phẩm này"));

        if (inventory.getQuantity() < 1) {
            throw new RuntimeException("Không có vật phẩm để sử dụng");
        }

        // Apply item effects based on type
        applyItemEffects(user, item);

        // Remove one item from inventory
        removeItemFromInventory(inventory, 1);

        // Update user's item count
        int totalItems = userInventoryRepository.findByUserId(userId).stream()
                .mapToInt(UserInventory::getQuantity)
                .sum();
        userService.updateUserStats(userId, user.getTotalPets(), totalItems);
    }

    private void addItemToInventory(User user, Item item, int quantity) {
        Optional<UserInventory> existingInventory = userInventoryRepository.findByUserIdAndItemId(user.getId(),
                item.getId());

        if (existingInventory.isPresent()) {
            UserInventory inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + quantity);
            userInventoryRepository.save(inventory);
        } else {
            UserInventory newInventory = new UserInventory();
            newInventory.setUser(user);
            newInventory.setItem(item);
            newInventory.setQuantity(quantity);
            newInventory.setObtainedAt(LocalDateTime.now());
            userInventoryRepository.save(newInventory);
        }
    }

    private void removeItemFromInventory(UserInventory inventory, int quantity) {
        if (inventory.getQuantity() <= quantity) {
            userInventoryRepository.delete(inventory);
        } else {
            inventory.setQuantity(inventory.getQuantity() - quantity);
            userInventoryRepository.save(inventory);
        }
    }

    private void applyItemEffects(User user, Item item) {
        switch (item.getType()) {
            case FOOD:
                // Food items give coins and experience
                userService.updateCoins(user.getId(), 50);
                userService.addExperience(user.getId(), 10);
                break;
            case MEDICINE:
                // Medicine items give health to all pets (handled in PetService)
                userService.addExperience(user.getId(), 15);
                break;
            case TOY:
                // Toy items give experience and happiness to pets
                userService.addExperience(user.getId(), 20);
                break;
            case ACCESSORY:
                // Accessory items are permanent boosts (handled separately)
                userService.addExperience(user.getId(), 5);
                break;
        }
    }

    private ItemDTO convertToDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setType(item.getType());
        dto.setRarity(item.getRarity());
        dto.setDescription(item.getDescription());
        dto.setImageUrl(item.getImageUrl());
        dto.setPrice(item.getPrice() != null ? item.getPrice().doubleValue() : null);
        dto.setSellPrice(item.getSellPrice() != null ? item.getSellPrice().doubleValue() : null);
        dto.setIsInShop(item.getIsInShop());
        dto.setStats(item.getStats());
        dto.setEffects(item.getEffects());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }

    private Item convertToEntity(ItemDTO dto) {
        Item item = new Item();
        item.setId(dto.getId());
        item.setName(dto.getName());
        item.setType(dto.getType());
        item.setRarity(dto.getRarity());
        item.setDescription(dto.getDescription());
        item.setImageUrl(dto.getImageUrl());
        item.setPrice(dto.getPrice() != null ? dto.getPrice().intValue() : null);
        item.setSellPrice(dto.getSellPrice() != null ? dto.getSellPrice().intValue() : null);
        item.setIsInShop(dto.getIsInShop());
        item.setStats(dto.getStats());
        item.setEffects(dto.getEffects());
        return item;
    }
}
