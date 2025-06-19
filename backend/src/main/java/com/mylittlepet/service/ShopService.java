package com.mylittlepet.service;

import com.mylittlepet.dto.ShopDTO;

import java.util.List;
import java.util.Optional;

public interface ShopService {

    // Get all shops
    List<ShopDTO> getAllShops();

    // Get shop by ID
    Optional<ShopDTO> getShopById(Integer id);

    // Get shops by type
    List<ShopDTO> getShopsByType(String type);

    // Search shops by keyword
    List<ShopDTO> searchShops(String keyword);

    // Create new shop
    ShopDTO createShop(ShopDTO shopDTO);

    // Update shop
    ShopDTO updateShop(Integer id, ShopDTO shopDTO);

    // Delete shop
    boolean deleteShop(Integer id);
}
