package com.mylittlepet.config;

import com.mylittlepet.entity.Item;
import com.mylittlepet.entity.Pet;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.ItemRepository;
import com.mylittlepet.repository.PetRepository;
import com.mylittlepet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (itemRepository.count() == 0) {
            seedItems();
        }
        if (petRepository.count() == 0) {
            seedPets();
        }
    }

    private void seedUsers() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@mylittlepet.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Quản trị viên");
        admin.setRole(User.UserRole.ADMIN);
        admin.setStatus(User.UserStatus.ACTIVE);
        admin.setLevel(10);
        admin.setExperience(1000);
        admin.setCoins(10000);
        admin.setTotalPets(0);
        admin.setTotalItems(0);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin.setLastLogin(LocalDateTime.now());
        userRepository.save(admin);

        // Create demo user
        User user = new User();
        user.setUsername("demo");
        user.setEmail("demo@mylittlepet.com");
        user.setPassword(passwordEncoder.encode("demo123"));
        user.setFullName("Người dùng demo");
        user.setRole(User.UserRole.USER);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setLevel(1);
        user.setExperience(0);
        user.setCoins(1000);
        user.setTotalPets(0);
        user.setTotalItems(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        System.out.println("Seeded users: admin/admin123, demo/demo123");
    }

    private void seedItems() {
        // Food items
        createItem("Thức ăn cho chó", Item.ItemType.FOOD, Item.RarityType.COMMON,
                "Thức ăn dinh dưỡng cho chó", 50, 25, true,
                "Tăng 10 HP, giảm 20 đói", "Tăng sức khỏe");

        createItem("Thức ăn cho mèo", Item.ItemType.FOOD, Item.RarityType.COMMON,
                "Thức ăn dinh dưỡng cho mèo", 45, 22, true,
                "Tăng 10 HP, giảm 25 đói", "Tăng sức khỏe");

        createItem("Thức ăn đặc biệt", Item.ItemType.FOOD, Item.RarityType.RARE,
                "Thức ăn cao cấp cho tất cả thú cưng", 150, 75, true,
                "Tăng 25 HP, giảm 50 đói", "Tăng sức khỏe và hạnh phúc");

        // Medicine items
        createItem("Thuốc cảm lạnh", Item.ItemType.MEDICINE, Item.RarityType.COMMON,
                "Chữa cảm lạnh cho thú cưng", 80, 40, true,
                "Tăng 30 HP", "Chữa bệnh cảm lạnh");

        createItem("Thuốc tăng lực", Item.ItemType.MEDICINE, Item.RarityType.UNCOMMON,
                "Tăng sức mạnh cho thú cưng", 120, 60, true,
                "Tăng 15 Attack", "Tăng sức mạnh");

        createItem("Thuốc hồi sinh", Item.ItemType.MEDICINE, Item.RarityType.LEGENDARY,
                "Hồi sinh thú cưng đã chết", 500, 250, true,
                "Hồi sinh với 50% HP", "Hồi sinh thú cưng");

        // Toy items
        createItem("Bóng tennis", Item.ItemType.TOY, Item.RarityType.COMMON,
                "Đồ chơi bóng tennis cho chó", 30, 15, true,
                "Tăng 15 Happiness", "Tăng hạnh phúc");

        createItem("Chuột đồ chơi", Item.ItemType.TOY, Item.RarityType.COMMON,
                "Đồ chơi chuột cho mèo", 25, 12, true,
                "Tăng 12 Happiness", "Tăng hạnh phúc");

        createItem("Đồ chơi thông minh", Item.ItemType.TOY, Item.RarityType.RARE,
                "Đồ chơi phát triển trí tuệ", 200, 100, true,
                "Tăng 25 Happiness, 10 EXP", "Tăng hạnh phúc và kinh nghiệm");

        // Accessory items
        createItem("Vòng cổ da", Item.ItemType.ACCESSORY, Item.RarityType.COMMON,
                "Vòng cổ da đơn giản", 60, 30, true,
                "Tăng 5 Defense", "Tăng phòng thủ");

        createItem("Vòng cổ vàng", Item.ItemType.ACCESSORY, Item.RarityType.EPIC,
                "Vòng cổ vàng cao cấp", 300, 150, true,
                "Tăng 20 Defense, 10 Speed", "Tăng phòng thủ và tốc độ");

        createItem("Vương miện", Item.ItemType.ACCESSORY, Item.RarityType.LEGENDARY,
                "Vương miện dành cho thú cưng hoàng gia", 1000, 500, true,
                "Tăng 30 Attack, 30 Defense, 30 Speed", "Tăng tất cả chỉ số");

        System.out.println("Seeded " + itemRepository.count() + " items");
    }

    private void createItem(String name, Item.ItemType type, Item.RarityType rarity,
            String description, int price, int sellPrice, boolean inShop,
            String stats, String effects) {
        Item item = new Item();
        item.setName(name);
        item.setType(type);
        item.setRarity(rarity);
        item.setDescription(description);
        item.setPrice(price);
        item.setSellPrice(sellPrice);
        item.setIsInShop(inShop);
        item.setImageUrl("/images/items/" + name.toLowerCase().replace(" ", "_") + ".png");

        // Create stats map
        Map<String, Integer> statsMap = new HashMap<>();
        // This is a simplified stats parsing - in real app you'd parse the stats string
        statsMap.put("description", 1);
        item.setStats(statsMap);

        // Create effects map
        Map<String, String> effectsMap = new HashMap<>();
        effectsMap.put("effect", effects);
        item.setEffects(effectsMap);

        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        itemRepository.save(item);
    }

    private void seedPets() {
        // Get demo user
        User demoUser = userRepository.findByUsername("demo").orElse(null);
        if (demoUser == null)
            return;

        // Create sample pets
        createPet("Buddy", Pet.PetType.DOG, Pet.RarityType.COMMON, demoUser,
                "Chú chó Golden Retriever thân thiện",
                Arrays.asList("Tìm kiếm", "Bảo vệ", "Chơi đùa"));

        createPet("Whiskers", Pet.PetType.CAT, Pet.RarityType.UNCOMMON, demoUser,
                "Chú mèo Ba Tư xinh đẹp",
                Arrays.asList("Leo trèo", "Săn bắt", "Ngủ"));

        createPet("Charlie", Pet.PetType.BIRD, Pet.RarityType.RARE, demoUser,
                "Chú chim Vẹt thông minh",
                Arrays.asList("Bay", "Bắt chước giọng nói", "Hát"));

        createPet("Nemo", Pet.PetType.FISH, Pet.RarityType.COMMON, demoUser,
                "Chú cá vàng nhỏ xinh",
                Arrays.asList("Bơi lội", "Thả bong bóng", "Khám phá"));

        createPet("Rex", Pet.PetType.REPTILE, Pet.RarityType.EPIC, demoUser,
                "Chú rồng râu mini",
                Arrays.asList("Phun lửa nhỏ", "Leo trèo", "Tắm nắng"));

        System.out.println("Seeded " + petRepository.count() + " pets");
    }

    private void createPet(String name, Pet.PetType type, Pet.RarityType rarity, User owner,
            String description, java.util.List<String> abilities) {
        Pet pet = new Pet();
        pet.setName(name);
        pet.setType(type);
        pet.setRarity(rarity);
        pet.setOwner(owner);
        pet.setDescription(description);
        pet.setStatus(Pet.PetStatus.HEALTHY);
        pet.setLevel(1);
        pet.setImageUrl("/images/pets/" + type.toString().toLowerCase() + "_" +
                rarity.toString().toLowerCase() + ".png");

        // Set stats based on rarity
        int baseStats = switch (rarity) {
            case COMMON -> 50;
            case UNCOMMON -> 70;
            case RARE -> 90;
            case EPIC -> 110;
            case LEGENDARY -> 130;
        };

        pet.setAttack(baseStats + (int) (Math.random() * 20));
        pet.setDefense(baseStats + (int) (Math.random() * 20));
        pet.setSpeed(baseStats + (int) (Math.random() * 20));
        pet.setMaxHealth(100 + (baseStats - 50));
        pet.setHealth(pet.getMaxHealth());
        pet.setHappiness(100);
        pet.setEnergy(100);
        pet.setHunger(0);
        pet.setAbilities(abilities);
        pet.setCreatedAt(LocalDateTime.now());
        pet.setUpdatedAt(LocalDateTime.now());

        petRepository.save(pet);
    }
}
