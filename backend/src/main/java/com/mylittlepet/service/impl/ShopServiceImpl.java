package com.mylittlepet.service.impl;

import com.mylittlepet.dto.ShopDTO;
import com.mylittlepet.entity.Shop;
import com.mylittlepet.repository.ShopRepository;
import com.mylittlepet.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShopServiceImpl implements ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Override
    public List<ShopDTO> getAllShops() {
        return shopRepository.findAllOrderByName()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ShopDTO> getShopById(Integer id) {
        return shopRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    public List<ShopDTO> getShopsByType(String type) {
        return shopRepository.findByType(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShopDTO> searchShops(String keyword) {
        return shopRepository.searchShops(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ShopDTO createShop(ShopDTO shopDTO) {
        Shop shop = convertToEntity(shopDTO);
        Shop savedShop = shopRepository.save(shop);
        return convertToDTO(savedShop);
    }

    @Override
    public ShopDTO updateShop(Integer id, ShopDTO shopDTO) {
        Optional<Shop> existingShop = shopRepository.findById(id);
        if (existingShop.isPresent()) {
            Shop shop = existingShop.get();
            shop.setName(shopDTO.getName());
            shop.setType(shopDTO.getType());
            shop.setDescription(shopDTO.getDescription());

            Shop updatedShop = shopRepository.save(shop);
            return convertToDTO(updatedShop);
        }
        return null;
    }

    @Override
    public boolean deleteShop(Integer id) {
        if (shopRepository.existsById(id)) {
            shopRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Helper methods to convert between Entity and DTO
    private ShopDTO convertToDTO(Shop shop) {
        return new ShopDTO(
                shop.getShopId(),
                shop.getName(),
                shop.getType(),
                shop.getDescription());
    }

    private Shop convertToEntity(ShopDTO shopDTO) {
        Shop shop = new Shop();
        shop.setName(shopDTO.getName());
        shop.setType(shopDTO.getType());
        shop.setDescription(shopDTO.getDescription());
        return shop;
    }
}
