-- Sample data for My Little Pet V3 Database
-- This script inserts sample data for testing purposes

USE My_Little_Pet_V3;
GO

-- Insert sample users
INSERT INTO [User] (UserName, Email, Password, Role, Level, Coin, Diamond, Gem)
VALUES 
    ('admin', 'admin@mylittlepet.com', '$2a$10$DyxhQH1VelZzQsf9z7V0q.rXjmKzKzKzKzKzKzKzKzKzKzKzKzKzK', 'Admin', 10, 10000, 500, 1000),
    ('manager', 'manager@mylittlepet.com', '$2a$10$DyxhQH1VelZzQsf9z7V0q.rXjmKzKzKzKzKzKzKzKzKzKzKzKzKzK', 'Manager', 5, 5000, 200, 500),
    ('player1', 'player1@example.com', '$2a$10$DyxhQH1VelZzQsf9z7V0q.rXjmKzKzKzKzKzKzKzKzKzKzKzKzKzK', 'Player', 1, 100, 0, 50),
    ('player2', 'player2@example.com', '$2a$10$DyxhQH1VelZzQsf9z7V0q.rXjmKzKzKzKzKzKzKzKzKzKzKzKzKzK', 'Player', 2, 250, 10, 100),
    ('testuser', 'test@example.com', '$2a$10$DyxhQH1VelZzQsf9z7V0q.rXjmKzKzKzKzKzKzKzKzKzKzKzKzKzK', 'Player', 1, 50, 0, 25);

-- Insert sample shops
INSERT INTO Shop (Name, Type, Description)
VALUES 
    ('Pet Palace', 'General', 'The ultimate pet supply store'),
    ('Health Store', 'Medical', 'Medical supplies for your pets'),
    ('Toy World', 'Entertainment', 'Fun toys and accessories for pets');

-- Insert sample pets
INSERT INTO Pet (AdminID, PetType, Description)
VALUES 
    (1, 'Dog', 'Loyal and friendly companion'),
    (1, 'Cat', 'Independent and playful feline'),
    (1, 'Rabbit', 'Cute and gentle herbivore'),
    (1, 'Bird', 'Colorful and musical friend'),
    (1, 'Fish', 'Peaceful aquatic companion');

-- Insert sample shop products
INSERT INTO ShopProduct (ShopID, AdminID, Name, Type, Description, ImageUrl, Price, CurrencyType, Quality)
VALUES 
    (1, 1, 'Dog Food', 'Food', 'Nutritious food for dogs', '/images/dog-food.jpg', 10, 'Coin', 100),
    (1, 1, 'Cat Food', 'Food', 'Delicious food for cats', '/images/cat-food.jpg', 10, 'Coin', 100),
    (2, 1, 'Health Potion', 'Medicine', 'Restores pet health', '/images/health-potion.jpg', 25, 'Coin', 100),
    (2, 1, 'Energy Drink', 'Medicine', 'Restores pet energy', '/images/energy-drink.jpg', 15, 'Coin', 100),
    (3, 1, 'Toy Ball', 'Toy', 'Increases pet happiness', '/images/toy-ball.jpg', 20, 'Coin', 100),
    (3, 1, 'Squeaky Toy', 'Toy', 'Fun toy for pets', '/images/squeaky-toy.jpg', 18, 'Coin', 100),
    (1, 1, 'Pet Shampoo', 'Accessory', 'Keeps pets clean and happy', '/images/shampoo.jpg', 12, 'Coin', 100),
    (2, 1, 'Vitamin Pills', 'Medicine', 'Boosts pet health over time', '/images/vitamins.jpg', 30, 'Coin', 100);

-- Insert sample player pets
INSERT INTO PlayerPet (PlayerID, PetID, PetName, Level, Status)
VALUES 
    (3, 1, 'Buddy', 1, 'Happy'),
    (3, 2, 'Whiskers', 2, 'Healthy'),
    (4, 1, 'Rex', 1, 'Playful'),
    (4, 3, 'Fluffy', 2, 'Content'),
    (5, 2, 'Mittens', 1, 'Sleepy');

-- Insert sample player inventories
INSERT INTO PlayerInventory (PlayerID, ShopProductID, Quantity)
VALUES 
    (3, 1, 5), -- player1 has 5 Dog Food
    (3, 3, 2), -- player1 has 2 Health Potions
    (3, 5, 1), -- player1 has 1 Toy Ball
    (4, 1, 3), -- player2 has 3 Dog Food
    (4, 2, 4), -- player2 has 4 Cat Food
    (4, 4, 1), -- player2 has 1 Energy Drink
    (5, 2, 2), -- testuser has 2 Cat Food
    (5, 6, 1); -- testuser has 1 Squeaky Toy

-- Insert sample care activities
INSERT INTO CareActivity (ActivityType, Description)
VALUES 
    ('Feed', 'Feed your pet to restore hunger'),
    ('Play', 'Play with your pet to increase happiness'),
    ('Heal', 'Use medicine to restore health'),
    ('Rest', 'Let your pet rest to restore energy'),
    ('Exercise', 'Exercise with your pet'),
    ('Groom', 'Groom your pet for happiness and health');

-- Insert sample care history
INSERT INTO CareHistory (PlayerPetID, PlayerID, ActivityID)
VALUES 
    (1, 3, 1), -- Buddy was fed
    (1, 3, 2), -- Buddy played
    (2, 3, 1), -- Whiskers was fed
    (3, 4, 1), -- Rex was fed
    (4, 4, 2), -- Fluffy played
    (5, 5, 1); -- Mittens was fed

-- Insert sample achievements
INSERT INTO Achievement (AchievementName, Description)
VALUES 
    ('First Pet', 'Adopted your first pet'),
    ('Caretaker', 'Fed your pet 10 times'),
    ('Pet Lover', 'Adopted 2 pets'),
    ('Dedicated Owner', 'Played with your pet 20 times'),
    ('Veteran Player', 'Reached level 5');

-- Insert sample player achievements
INSERT INTO PlayerAchievement (PlayerID, AchievementID)
VALUES 
    (3, 1), -- player1 got First Pet
    (3, 2), -- player1 got Caretaker
    (4, 1), -- player2 got First Pet
    (4, 3), -- player2 got Pet Lover
    (5, 1); -- testuser got First Pet

-- Insert sample minigames
INSERT INTO Minigame (Name, Description)
VALUES 
    ('Pet Race', 'Race your pet against others'),
    ('Fetch Game', 'Play fetch with your pet'),
    ('Hide and Seek', 'Find your hidden pet'),
    ('Obstacle Course', 'Navigate through obstacles'),
    ('Memory Game', 'Test your memory with pet patterns');

-- Insert sample game records
INSERT INTO GameRecord (PlayerID, MinigameID, Score)
VALUES 
    (3, 1, 150), -- player1 scored 150 in Pet Race
    (3, 2, 200), -- player1 scored 200 in Fetch Game
    (4, 1, 175), -- player2 scored 175 in Pet Race
    (4, 3, 120), -- player2 scored 120 in Hide and Seek
    (5, 2, 90);  -- testuser scored 90 in Fetch Game

PRINT 'Sample data inserted successfully!';
GO
