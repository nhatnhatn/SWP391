package com.mylittlepet.repository;

import com.mylittlepet.entity.ShopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopProductRepository extends JpaRepository<ShopProduct, Integer> {

    // Find shop products by shop ID
    List<ShopProduct> findByShopId(Integer shopId);

    // Find shop products by type
    List<ShopProduct> findByType(String type);

    // Find shop products by status
    List<ShopProduct> findByStatus(Integer status);

    // Find shop products by currency type
    List<ShopProduct> findByCurrencyType(String currencyType);

    // Find shop products by admin ID
    List<ShopProduct> findByAdmin_Id(Integer adminId);

    // Find shop products by pet ID
    List<ShopProduct> findByPetID(Integer petID);

    // Find shop products by price range
    @Query("SELECT sp FROM ShopProduct sp WHERE sp.price BETWEEN :minPrice AND :maxPrice")
    List<ShopProduct> findByPriceRange(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);

    // Search shop products by name
    @Query("SELECT sp FROM ShopProduct sp WHERE LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ShopProduct> findByNameContainingIgnoreCase(@Param("keyword") String keyword);

    // Search shop products by name or description
    @Query("SELECT sp FROM ShopProduct sp WHERE LOWER(sp.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(sp.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ShopProduct> searchShopProducts(@Param("keyword") String keyword);

    // Find all shop products ordered by name
    @Query("SELECT sp FROM ShopProduct sp ORDER BY sp.name ASC")
    List<ShopProduct> findAllOrderByName();

    // Find all shop products ordered by price
    @Query("SELECT sp FROM ShopProduct sp ORDER BY sp.price ASC")
    List<ShopProduct> findAllOrderByPrice();

    // Find active shop products (status = 1)
    @Query("SELECT sp FROM ShopProduct sp WHERE sp.status = 1 ORDER BY sp.name ASC")
    List<ShopProduct> findActiveShopProducts();
}