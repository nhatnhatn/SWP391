package com.mylittlepet.service;

import com.mylittlepet.dto.ShopProductDTO;

import java.util.List;
import java.util.Optional;

public interface ShopProductService {

    // Get all shop products
    List<ShopProductDTO> getAllShopProducts();

    // Get shop product by ID
    Optional<ShopProductDTO> getShopProductById(Integer id);

    // Get shop products by shop ID
    List<ShopProductDTO> getShopProductsByShopId(Integer shopId);

    // Get shop products by type
    List<ShopProductDTO> getShopProductsByType(String type);

    // Get shop products by status
    List<ShopProductDTO> getShopProductsByStatus(Integer status);

    // Get shop products by currency type
    List<ShopProductDTO> getShopProductsByCurrencyType(String currencyType);

    // Get shop products by admin ID
    List<ShopProductDTO> getShopProductsByAdminId(Integer adminId);

    // Get shop products by price range
    List<ShopProductDTO> getShopProductsByPriceRange(Integer minPrice, Integer maxPrice);

    // Search shop products by keyword
    List<ShopProductDTO> searchShopProducts(String keyword);

    // Get active shop products
    List<ShopProductDTO> getActiveShopProducts();

    // Create new shop product
    ShopProductDTO createShopProduct(ShopProductDTO shopProductDTO);

    // Update shop product
    ShopProductDTO updateShopProduct(Integer id, ShopProductDTO shopProductDTO);

    // Delete shop product
    boolean deleteShopProduct(Integer id);

    // Update shop product status
    ShopProductDTO updateShopProductStatus(Integer id, Integer status);
}