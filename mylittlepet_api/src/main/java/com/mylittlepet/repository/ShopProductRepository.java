package com.mylittlepet.repository;

import com.mylittlepet.entity.ShopProduct;
import com.mylittlepet.entity.Shop;
import com.mylittlepet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopProductRepository extends JpaRepository<ShopProduct, Integer> {
    List<ShopProduct> findByShop(Shop shop);

    List<ShopProduct> findByAdmin(User admin);

    List<ShopProduct> findByType(String type);

    List<ShopProduct> findByCurrencyType(String currencyType);

    List<ShopProduct> findByNameContainingIgnoreCase(String name);

    Page<ShopProduct> findByShop(Shop shop, Pageable pageable);

    Page<ShopProduct> findByType(String type, Pageable pageable);

    Page<ShopProduct> findByCurrencyType(String currencyType, Pageable pageable);

    @Query("SELECT sp FROM ShopProduct sp WHERE " +
            "LOWER(sp.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(sp.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<ShopProduct> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("search") String search, Pageable pageable);

    @Query("SELECT sp FROM ShopProduct sp WHERE sp.price BETWEEN :minPrice AND :maxPrice")
    List<ShopProduct> findByPriceRange(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);
}
