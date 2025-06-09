// Simple Express.js mock backend for testing the integration
// This server mimics the Spring Boot API endpoints for testing purposes

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'mylittlepet_jwt_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
let users = [
    {
        id: 1,
        email: 'admin@mylittlepet.com',
        password: 'admin123',
        name: 'Quản trị viên',
        role: 'admin'
    },
    {
        id: 2,
        email: 'user@mylittlepet.com',
        password: 'user123',
        name: 'Người dùng',
        role: 'user'
    }
];

let players = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        email: 'an@example.com',
        joinDate: '2024-01-15',
        level: 15,
        coins: 2500,
        status: 'active'
    },
    {
        id: 2,
        name: 'Trần Thị Bình',
        email: 'binh@example.com',
        joinDate: '2024-02-20',
        level: 12,
        coins: 1800,
        status: 'active'
    },
    {
        id: 3,
        name: 'Lê Văn Cường',
        email: 'cuong@example.com',
        joinDate: '2024-03-10',
        level: 8,
        coins: 1200,
        status: 'inactive'
    }
];

let pets = [
    {
        id: 1,
        name: 'Milo',
        type: 'Chó',
        breed: 'Golden Retriever',
        age: 2,
        ownerId: 1,
        health: 85,
        happiness: 90,
        energy: 75,
        lastFed: '2024-06-09T08:00:00Z',
        status: 'healthy'
    },
    {
        id: 2,
        name: 'Bella',
        type: 'Mèo',
        breed: 'Persian',
        age: 3,
        ownerId: 1,
        health: 92,
        happiness: 88,
        energy: 80,
        lastFed: '2024-06-09T09:30:00Z',
        status: 'healthy'
    },
    {
        id: 3,
        name: 'Max',
        type: 'Chó',
        breed: 'Bulldog',
        age: 4,
        ownerId: 2,
        health: 78,
        happiness: 65,
        energy: 60,
        lastFed: '2024-06-09T07:45:00Z',
        status: 'needs_attention'
    }
];

let items = [
    {
        id: 1,
        name: 'Thức ăn cho chó',
        description: 'Thức ăn chất lượng cao cho chó',
        category: 'food',
        price: 150,
        stock: 50,
        image: '/images/dog-food.jpg'
    },
    {
        id: 2,
        name: 'Đồ chơi bóng',
        description: 'Bóng cao su cho thú cưng',
        category: 'toy',
        price: 75,
        stock: 30,
        image: '/images/ball-toy.jpg'
    },
    {
        id: 3,
        name: 'Thuốc vitamin',
        description: 'Vitamin tổng hợp cho thú cưng',
        category: 'medicine',
        price: 200,
        stock: 25,
        image: '/images/vitamins.jpg'
    }
];

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            message: 'Không có token xác thực',
            error: 'UNAUTHORIZED'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token không hợp lệ',
            error: 'INVALID_TOKEN'
        });
    }
};

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Máy chủ backend đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email và mật khẩu là bắt buộc',
            error: 'MISSING_CREDENTIALS'
        });
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({
            message: 'Email hoặc mật khẩu không đúng',
            error: 'INVALID_CREDENTIALS'
        });
    }

    const token = generateToken(user);

    res.json({
        message: 'Đăng nhập thành công',
        token,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    });
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            message: 'Email, mật khẩu và tên là bắt buộc',
            error: 'MISSING_FIELDS'
        });
    }

    if (users.find(u => u.email === email)) {
        return res.status(409).json({
            message: 'Email đã được sử dụng',
            error: 'EMAIL_EXISTS'
        });
    }

    const newUser = {
        id: users.length + 1,
        email,
        password,
        name,
        role: 'user'
    };

    users.push(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
        message: 'Đăng ký thành công',
        token,
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
    });
});

// Players endpoints
app.get('/api/players', verifyToken, (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    let filteredPlayers = players;
    if (search) {
        filteredPlayers = players.filter(player =>
            player.name.toLowerCase().includes(search.toLowerCase()) ||
            player.email.toLowerCase().includes(search.toLowerCase())
        );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

    res.json({
        data: paginatedPlayers,
        pagination: {
            current: parseInt(page),
            total: Math.ceil(filteredPlayers.length / limit),
            count: filteredPlayers.length
        }
    });
});

app.post('/api/players', verifyToken, (req, res) => {
    const newPlayer = {
        id: players.length + 1,
        ...req.body,
        joinDate: new Date().toISOString().split('T')[0],
        level: 1,
        coins: 100,
        status: 'active'
    };

    players.push(newPlayer);
    res.status(201).json(newPlayer);
});

app.put('/api/players/:id', verifyToken, (req, res) => {
    const playerId = parseInt(req.params.id);
    const playerIndex = players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy người chơi',
            error: 'PLAYER_NOT_FOUND'
        });
    }

    players[playerIndex] = { ...players[playerIndex], ...req.body };
    res.json(players[playerIndex]);
});

app.delete('/api/players/:id', verifyToken, (req, res) => {
    const playerId = parseInt(req.params.id);
    const playerIndex = players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy người chơi',
            error: 'PLAYER_NOT_FOUND'
        });
    }

    players.splice(playerIndex, 1);
    res.json({ message: 'Xóa người chơi thành công' });
});

// Pets endpoints
app.get('/api/pets', verifyToken, (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    let filteredPets = pets;
    if (search) {
        filteredPets = pets.filter(pet =>
            pet.name.toLowerCase().includes(search.toLowerCase()) ||
            pet.type.toLowerCase().includes(search.toLowerCase())
        );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPets = filteredPets.slice(startIndex, endIndex);

    res.json({
        data: paginatedPets,
        pagination: {
            current: parseInt(page),
            total: Math.ceil(filteredPets.length / limit),
            count: filteredPets.length
        }
    });
});

app.post('/api/pets', verifyToken, (req, res) => {
    const newPet = {
        id: pets.length + 1,
        ...req.body,
        health: 100,
        happiness: 100,
        energy: 100,
        lastFed: new Date().toISOString(),
        status: 'healthy'
    };

    pets.push(newPet);
    res.status(201).json(newPet);
});

app.put('/api/pets/:id', verifyToken, (req, res) => {
    const petId = parseInt(req.params.id);
    const petIndex = pets.findIndex(p => p.id === petId);

    if (petIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy thú cưng',
            error: 'PET_NOT_FOUND'
        });
    }

    pets[petIndex] = { ...pets[petIndex], ...req.body };
    res.json(pets[petIndex]);
});

app.delete('/api/pets/:id', verifyToken, (req, res) => {
    const petId = parseInt(req.params.id);
    const petIndex = pets.findIndex(p => p.id === petId);

    if (petIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy thú cưng',
            error: 'PET_NOT_FOUND'
        });
    }

    pets.splice(petIndex, 1);
    res.json({ message: 'Xóa thú cưng thành công' });
});

// Pet care actions
app.post('/api/pets/:id/feed', verifyToken, (req, res) => {
    const petId = parseInt(req.params.id);
    const pet = pets.find(p => p.id === petId);

    if (!pet) {
        return res.status(404).json({
            message: 'Không tìm thấy thú cưng',
            error: 'PET_NOT_FOUND'
        });
    }

    pet.health = Math.min(100, pet.health + 10);
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.lastFed = new Date().toISOString();

    res.json({
        message: 'Cho ăn thành công',
        pet
    });
});

app.post('/api/pets/:id/play', verifyToken, (req, res) => {
    const petId = parseInt(req.params.id);
    const pet = pets.find(p => p.id === petId);

    if (!pet) {
        return res.status(404).json({
            message: 'Không tìm thấy thú cưng',
            error: 'PET_NOT_FOUND'
        });
    }

    pet.happiness = Math.min(100, pet.happiness + 15);
    pet.energy = Math.max(0, pet.energy - 10);

    res.json({
        message: 'Chơi với thú cưng thành công',
        pet
    });
});

app.post('/api/pets/:id/rest', verifyToken, (req, res) => {
    const petId = parseInt(req.params.id);
    const pet = pets.find(p => p.id === petId);

    if (!pet) {
        return res.status(404).json({
            message: 'Không tìm thấy thú cưng',
            error: 'PET_NOT_FOUND'
        });
    }

    pet.energy = Math.min(100, pet.energy + 20);
    pet.health = Math.min(100, pet.health + 5);

    res.json({
        message: 'Nghỉ ngơi thành công',
        pet
    });
});

// Items endpoints
app.get('/api/items', verifyToken, (req, res) => {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;

    let filteredItems = items;
    if (search) {
        filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
        data: paginatedItems,
        pagination: {
            current: parseInt(page),
            total: Math.ceil(filteredItems.length / limit),
            count: filteredItems.length
        }
    });
});

app.post('/api/items', verifyToken, (req, res) => {
    const newItem = {
        id: items.length + 1,
        ...req.body
    };

    items.push(newItem);
    res.status(201).json(newItem);
});

app.put('/api/items/:id', verifyToken, (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy vật phẩm',
            error: 'ITEM_NOT_FOUND'
        });
    }

    items[itemIndex] = { ...items[itemIndex], ...req.body };
    res.json(items[itemIndex]);
});

app.delete('/api/items/:id', verifyToken, (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({
            message: 'Không tìm thấy vật phẩm',
            error: 'ITEM_NOT_FOUND'
        });
    }

    items.splice(itemIndex, 1);
    res.json({ message: 'Xóa vật phẩm thành công' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock backend server đang chạy trên http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/auth/health`);
    console.log(`🔐 Test login: admin@mylittlepet.com / admin123`);
});

module.exports = app;
