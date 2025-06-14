package com.mylittlepet.service;

import com.mylittlepet.dto.UserDTO;
import com.mylittlepet.entity.User;
import com.mylittlepet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<UserDTO> getAllUsersWithPagination(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDTO);
    }

    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDTO);
    }

    public Optional<UserDTO> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(this::convertToDTO);
    }

    public List<UserDTO> searchUsers(String keyword) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByStatus(User.UserStatus status) {
        return userRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = convertToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setLevel(1);
        user.setExperience(0);
        user.setTotalPets(0);
        user.setTotalItems(0);
        user.setCoins(1000); // Starting coins
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Update only non-null fields
        if (userDTO.getUsername() != null && !userDTO.getUsername().equals(existingUser.getUsername())) {
            if (userRepository.existsByUsername(userDTO.getUsername())) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại");
            }
            existingUser.setUsername(userDTO.getUsername());
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            existingUser.setEmail(userDTO.getEmail());
        }

        if (userDTO.getFullName() != null) {
            existingUser.setFullName(userDTO.getFullName());
        }

        if (userDTO.getPhone() != null) {
            existingUser.setPhone(userDTO.getPhone());
        }

        if (userDTO.getAddress() != null) {
            existingUser.setAddress(userDTO.getAddress());
        }

        if (userDTO.getStatus() != null) {
            existingUser.setStatus(userDTO.getStatus());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(existingUser);
        return convertToDTO(savedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setStatus(User.UserStatus.DELETED);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserDTO updateUserStats(Long userId, int petCount, int itemCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setTotalPets(petCount);
        user.setTotalItems(itemCount);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO addExperience(Long userId, int experience) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setExperience(user.getExperience() + experience);

        // Level up logic
        int newLevel = calculateLevel(user.getExperience());
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
            // Bonus coins for leveling up
            user.setCoins(user.getCoins() + (newLevel * 100));
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO updateCoins(Long userId, int coinChange) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        int newCoins = user.getCoins() + coinChange;
        if (newCoins < 0) {
            throw new RuntimeException("Không đủ xu để thực hiện giao dịch");
        }

        user.setCoins(newCoins);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    private int calculateLevel(int experience) {
        // Simple level calculation: level = sqrt(exp/100) + 1
        return (int) Math.floor(Math.sqrt(experience / 100.0)) + 1;
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setLevel(user.getLevel());
        dto.setExperience(user.getExperience());
        dto.setCoins(user.getCoins());
        dto.setTotalPets(user.getTotalPets());
        dto.setTotalItems(user.getTotalItems());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());
        user.setLevel(dto.getLevel());
        user.setExperience(dto.getExperience());
        user.setCoins(dto.getCoins());
        user.setTotalPets(dto.getTotalPets());
        user.setTotalItems(dto.getTotalItems());
        return user;
    }
}
