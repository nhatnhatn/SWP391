package com.mylittlepet.service.impl;

import com.mylittlepet.dto.ShopProductDTO;
import com.mylittlepet.entity.ShopProduct;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.ShopProductRepository;
import com.mylittlepet.repository.UserRepository;
import com.mylittlepet.service.ShopProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShopProductServiceImpl implements ShopProductService {

    @Autowired
    private ShopProductRepository shopProductRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<ShopProductDTO> getAllShopProducts() {
        return shopProductRepository.findAllOrderByName()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ShopProductDTO> getShopProductById(Integer id) {
        return shopProductRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public List<ShopProductDTO> getShopProductsByShopId(Integer shopId) {
        return shopProductRepository.findByShopId(shopId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getShopProductsByType(String type) {
        return shopProductRepository.findByType(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getShopProductsByStatus(Integer status) {
        return shopProductRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getShopProductsByCurrencyType(String currencyType) {
        return shopProductRepository.findByCurrencyType(currencyType)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getShopProductsByAdminId(Integer adminId) {
        return shopProductRepository.findByAdmin_Id(adminId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getShopProductsByPriceRange(Integer minPrice, Integer maxPrice) {
        return shopProductRepository.findByPriceRange(minPrice, maxPrice)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> searchShopProducts(String keyword) {
        return shopProductRepository.searchShopProducts(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopProductDTO> getActiveShopProducts() {
        return shopProductRepository.findActiveShopProducts()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ShopProductDTO createShopProduct(ShopProductDTO shopProductDTO) {
        ShopProduct shopProduct = convertToEntity(shopProductDTO);
        ShopProduct savedShopProduct = shopProductRepository.save(shopProduct);
        return convertToDTO(savedShopProduct);
    }

    @Override
    public ShopProductDTO updateShopProduct(Integer id, ShopProductDTO shopProductDTO) {
        Optional<ShopProduct> existingShopProduct = shopProductRepository.findById(id);
        if (existingShopProduct.isPresent()) {
            ShopProduct shopProduct = existingShopProduct.get();

            // Update shop id if provided
            if (shopProductDTO.getShopId() != null) {
                shopProduct.setShopId(shopProductDTO.getShopId());
            }

            // Update admin if provided
            if (shopProductDTO.getAdminId() != null) {
                Optional<User> admin = userRepository.findById(shopProductDTO.getAdminId());
                admin.ifPresent(shopProduct::setAdmin);
            }

            shopProduct.setName(shopProductDTO.getName());
            shopProduct.setType(shopProductDTO.getType());
            shopProduct.setDescription(shopProductDTO.getDescription());
            shopProduct.setImageUrl(shopProductDTO.getImageUrl());
            shopProduct.setPrice(shopProductDTO.getPrice());
            shopProduct.setCurrencyType(shopProductDTO.getCurrencyType());
            shopProduct.setQuality(shopProductDTO.getQuality());
            shopProduct.setStatus(shopProductDTO.getStatus());

            ShopProduct updatedShopProduct = shopProductRepository.save(shopProduct);
            return convertToDTO(updatedShopProduct);
        }
        return null;
    }

    @Override
    public boolean deleteShopProduct(Integer id) {
        if (shopProductRepository.existsById(id)) {
            shopProductRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public ShopProductDTO updateShopProductStatus(Integer id, Integer status) {
        Optional<ShopProduct> existingShopProduct = shopProductRepository.findById(id);
        if (existingShopProduct.isPresent()) {
            ShopProduct shopProduct = existingShopProduct.get();
            shopProduct.setStatus(status);
            ShopProduct updatedShopProduct = shopProductRepository.save(shopProduct);
            return convertToDTO(updatedShopProduct);
        }
        return null;
    } // Helper methods to convert between Entity and DTO

    private ShopProductDTO convertToDTO(ShopProduct shopProduct) {
        return new ShopProductDTO(
                shopProduct.getShopProductId(),
                shopProduct.getShopId(),
                "Shop " + shopProduct.getShopId(), // Simple shop name placeholder
                shopProduct.getAdmin() != null ? shopProduct.getAdmin().getId() : null,
                shopProduct.getAdmin() != null ? shopProduct.getAdmin().getUserName() : null,
                shopProduct.getName(),
                shopProduct.getType(),
                shopProduct.getDescription(),
                shopProduct.getImageUrl(),
                shopProduct.getPrice(),
                shopProduct.getCurrencyType(),
                shopProduct.getQuality(),
                shopProduct.getStatus());
    }

    private ShopProduct convertToEntity(ShopProductDTO shopProductDTO) {
        ShopProduct shopProduct = new ShopProduct();

        // Set shop id
        if (shopProductDTO.getShopId() != null) {
            shopProduct.setShopId(shopProductDTO.getShopId());
        }

        // Set admin
        if (shopProductDTO.getAdminId() != null) {
            Optional<User> admin = userRepository.findById(shopProductDTO.getAdminId());
            admin.ifPresent(shopProduct::setAdmin);
        }

        shopProduct.setName(shopProductDTO.getName());
        shopProduct.setType(shopProductDTO.getType());
        shopProduct.setDescription(shopProductDTO.getDescription());
        shopProduct.setImageUrl(shopProductDTO.getImageUrl());
        shopProduct.setPrice(shopProductDTO.getPrice());
        shopProduct.setCurrencyType(shopProductDTO.getCurrencyType());
        shopProduct.setQuality(shopProductDTO.getQuality() != null ? shopProductDTO.getQuality() : 100);
        shopProduct.setStatus(shopProductDTO.getStatus() != null ? shopProductDTO.getStatus() : 1);

        return shopProduct;
    }
}