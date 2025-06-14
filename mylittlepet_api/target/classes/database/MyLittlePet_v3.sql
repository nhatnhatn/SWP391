-- My Little Pet V3 Database Schema for SQL Server
-- This script creates the complete database schema for the My Little Pet application

-- Use the database
USE My_Little_Pet_V3;
GO

-- Create Users table
CREATE TABLE [User] (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Player',
    Coins INT NOT NULL DEFAULT 0,
    Experience INT NOT NULL DEFAULT 0,
    Level INT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastLoginDate DATETIME2,
    CONSTRAINT CK_User_Role CHECK (Role IN ('Player', 'Admin', 'Manager')),
    CONSTRAINT CK_User_Coins CHECK (Coins >= 0),
    CONSTRAINT CK_User_Experience CHECK (Experience >= 0),
    CONSTRAINT CK_User_Level CHECK (Level >= 1)
);

-- Create Pet table
CREATE TABLE Pet (
    PetID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT,
    PetType NVARCHAR(50) NOT NULL,
    Description NTEXT,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES [User](UserID)
);

-- Create PlayerPet table (User's pets)
CREATE TABLE PlayerPet (
    PlayerPetID INT IDENTITY(1,1) PRIMARY KEY,
    PlayerID INT NOT NULL,
    PetID INT NOT NULL,
    PetName NVARCHAR(100) NOT NULL,
    Health INT NOT NULL DEFAULT 100,
    Happiness INT NOT NULL DEFAULT 100,
    Hunger INT NOT NULL DEFAULT 100,
    Energy INT NOT NULL DEFAULT 100,
    Experience INT NOT NULL DEFAULT 0,
    Level INT NOT NULL DEFAULT 1,
    IsAlive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastCaredDate DATETIME2,
    FOREIGN KEY (PlayerID) REFERENCES [User](UserID),
    FOREIGN KEY (PetID) REFERENCES Pet(PetID),
    CONSTRAINT CK_PlayerPet_Health CHECK (Health >= 0 AND Health <= 100),
    CONSTRAINT CK_PlayerPet_Happiness CHECK (Happiness >= 0 AND Happiness <= 100),
    CONSTRAINT CK_PlayerPet_Hunger CHECK (Hunger >= 0 AND Hunger <= 100),
    CONSTRAINT CK_PlayerPet_Energy CHECK (Energy >= 0 AND Energy <= 100),
    CONSTRAINT CK_PlayerPet_Experience CHECK (Experience >= 0),
    CONSTRAINT CK_PlayerPet_Level CHECK (Level >= 1)
);

-- Create Item table
CREATE TABLE Item (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT,
    ItemName NVARCHAR(100) NOT NULL,
    ItemType NVARCHAR(50) NOT NULL,
    Description NTEXT,
    Price INT NOT NULL DEFAULT 0,
    EffectValue INT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES [User](UserID),
    CONSTRAINT CK_Item_Price CHECK (Price >= 0),
    CONSTRAINT CK_Item_Type CHECK (ItemType IN ('Food', 'Medicine', 'Toy', 'Accessory', 'Special'))
);

-- Create Shop table
CREATE TABLE Shop (
    ShopID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT,
    ShopName NVARCHAR(100) NOT NULL,
    Description NTEXT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES [User](UserID)
);

-- Create ShopProduct table (Items available in shops)
CREATE TABLE ShopProduct (
    ShopProductID INT IDENTITY(1,1) PRIMARY KEY,
    ShopID INT NOT NULL,
    ItemID INT NOT NULL,
    Price INT NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ShopID) REFERENCES Shop(ShopID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    CONSTRAINT CK_ShopProduct_Price CHECK (Price >= 0)
);

-- Create PlayerInventory table (User's items)
CREATE TABLE PlayerInventory (
    PlayerID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    ObtainedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (PlayerID, ItemID),
    FOREIGN KEY (PlayerID) REFERENCES [User](UserID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    CONSTRAINT CK_PlayerInventory_Quantity CHECK (Quantity >= 0)
);

-- Create UserInventory table (Alternative inventory structure)
CREATE TABLE UserInventory (
    UserInventoryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    ObtainedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES [User](UserID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
    CONSTRAINT CK_UserInventory_Quantity CHECK (Quantity >= 0)
);

-- Create CareActivity table (Types of care activities)
CREATE TABLE CareActivity (
    CareActivityID INT IDENTITY(1,1) PRIMARY KEY,
    ActivityName NVARCHAR(50) NOT NULL,
    Description NTEXT,
    HealthEffect INT DEFAULT 0,
    HappinessEffect INT DEFAULT 0,
    HungerEffect INT DEFAULT 0,
    EnergyEffect INT DEFAULT 0,
    CoinsCost INT DEFAULT 0,
    ExperienceGain INT DEFAULT 0,
    CONSTRAINT CK_CareActivity_CoinsCost CHECK (CoinsCost >= 0)
);

-- Create CareHistory table (History of pet care)
CREATE TABLE CareHistory (
    CareHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    PlayerPetID INT NOT NULL,
    CareActivityID INT NOT NULL,
    CareDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ItemUsedID INT,
    CoinsSpent INT DEFAULT 0,
    ExperienceGained INT DEFAULT 0,
    FOREIGN KEY (PlayerPetID) REFERENCES PlayerPet(PlayerPetID),
    FOREIGN KEY (CareActivityID) REFERENCES CareActivity(CareActivityID),
    FOREIGN KEY (ItemUsedID) REFERENCES Item(ItemID),
    CONSTRAINT CK_CareHistory_CoinsSpent CHECK (CoinsSpent >= 0),
    CONSTRAINT CK_CareHistory_ExperienceGained CHECK (ExperienceGained >= 0)
);

-- Create Minigame table
CREATE TABLE Minigame (
    MinigameID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT,
    GameName NVARCHAR(100) NOT NULL,
    Description NTEXT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES [User](UserID)
);

-- Create GameRecord table (Player's game records)
CREATE TABLE GameRecord (
    PlayerID INT NOT NULL,
    MinigameID INT NOT NULL,
    HighScore INT NOT NULL DEFAULT 0,
    TimesPlayed INT NOT NULL DEFAULT 0,
    LastPlayedDate DATETIME2,
    PRIMARY KEY (PlayerID, MinigameID),
    FOREIGN KEY (PlayerID) REFERENCES [User](UserID),
    FOREIGN KEY (MinigameID) REFERENCES Minigame(MinigameID),
    CONSTRAINT CK_GameRecord_HighScore CHECK (HighScore >= 0),
    CONSTRAINT CK_GameRecord_TimesPlayed CHECK (TimesPlayed >= 0)
);

-- Create PlayerAchievement table (Player achievements)
CREATE TABLE PlayerAchievement (
    PlayerID INT NOT NULL,
    AchievementName NVARCHAR(100) NOT NULL,
    AchievementDescription NTEXT,
    AchievedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    RewardCoins INT DEFAULT 0,
    PRIMARY KEY (PlayerID, AchievementName),
    FOREIGN KEY (PlayerID) REFERENCES [User](UserID),
    CONSTRAINT CK_PlayerAchievement_RewardCoins CHECK (RewardCoins >= 0)
);

-- Create ActivityLog table (System activity logging)
CREATE TABLE ActivityLog (
    ActivityLogID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    ActivityType NVARCHAR(50) NOT NULL,
    ActivityDescription NVARCHAR(500),
    ActivityDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    IPAddress NVARCHAR(45),
    FOREIGN KEY (UserID) REFERENCES [User](UserID)
);

-- Create AdminHistory table (Admin actions history)
CREATE TABLE AdminHistory (
    AdminHistoryID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT NOT NULL,
    ActionType NVARCHAR(50) NOT NULL,
    ActionDescription NVARCHAR(500),
    TargetUserID INT,
    ActionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (AdminID) REFERENCES [User](UserID),
    FOREIGN KEY (TargetUserID) REFERENCES [User](UserID)
);

-- Create AdminNote table (Admin notes)
CREATE TABLE AdminNote (
    AdminNoteID INT IDENTITY(1,1) PRIMARY KEY,
    AdminID INT NOT NULL,
    TargetUserID INT,
    NoteTitle NVARCHAR(200),
    NoteContent NTEXT,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (AdminID) REFERENCES [User](UserID),
    FOREIGN KEY (TargetUserID) REFERENCES [User](UserID)
);

-- Create Report table (User reports)
CREATE TABLE Report (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    ReporterID INT NOT NULL,
    ReportedUserID INT,
    ReportType NVARCHAR(50) NOT NULL,
    ReportDescription NTEXT,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CreatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    ResolvedDate DATETIME2,
    ResolvedByAdminID INT,
    FOREIGN KEY (ReporterID) REFERENCES [User](UserID),
    FOREIGN KEY (ReportedUserID) REFERENCES [User](UserID),
    FOREIGN KEY (ResolvedByAdminID) REFERENCES [User](UserID),
    CONSTRAINT CK_Report_Status CHECK (Status IN ('Pending', 'InProgress', 'Resolved', 'Rejected'))
);

-- Create indexes for better performance
CREATE INDEX IX_User_Username ON [User](Username);
CREATE INDEX IX_User_Email ON [User](Email);
CREATE INDEX IX_User_Role ON [User](Role);
CREATE INDEX IX_PlayerPet_PlayerID ON PlayerPet(PlayerID);
CREATE INDEX IX_PlayerPet_PetID ON PlayerPet(PetID);
CREATE INDEX IX_PlayerInventory_PlayerID ON PlayerInventory(PlayerID);
CREATE INDEX IX_UserInventory_UserID ON UserInventory(UserID);
CREATE INDEX IX_CareHistory_PlayerPetID ON CareHistory(PlayerPetID);
CREATE INDEX IX_GameRecord_PlayerID ON GameRecord(PlayerID);
CREATE INDEX IX_ActivityLog_UserID ON ActivityLog(UserID);
CREATE INDEX IX_ActivityLog_ActivityDate ON ActivityLog(ActivityDate);
CREATE INDEX IX_AdminHistory_AdminID ON AdminHistory(AdminID);
CREATE INDEX IX_Report_ReporterID ON Report(ReporterID);
CREATE INDEX IX_Report_Status ON Report(Status);

-- Insert default care activities
INSERT INTO CareActivity (ActivityName, Description, HealthEffect, HappinessEffect, HungerEffect, EnergyEffect, CoinsCost, ExperienceGain)
VALUES 
    ('Feed', 'Feed your pet to restore hunger', 0, 5, 30, 0, 5, 2),
    ('Play', 'Play with your pet to increase happiness', 0, 20, -10, -15, 0, 5),
    ('Heal', 'Use medicine to restore health', 50, 0, 0, 0, 20, 3),
    ('Rest', 'Let your pet rest to restore energy', 5, 0, -5, 30, 0, 1),
    ('Exercise', 'Exercise with your pet', 10, 10, -15, -20, 0, 8),
    ('Groom', 'Groom your pet for happiness and health', 5, 15, 0, -5, 10, 4);

-- Insert default pets
INSERT INTO Pet (PetType, Description)
VALUES 
    ('Dog', 'Loyal and friendly companion'),
    ('Cat', 'Independent and playful feline'),
    ('Rabbit', 'Cute and gentle herbivore'),
    ('Bird', 'Colorful and musical friend'),
    ('Fish', 'Peaceful aquatic companion');

-- Insert default items
INSERT INTO Item (ItemName, ItemType, Description, Price, EffectValue)
VALUES 
    ('Dog Food', 'Food', 'Nutritious food for dogs', 10, 25),
    ('Cat Food', 'Food', 'Delicious food for cats', 10, 25),
    ('Health Potion', 'Medicine', 'Restores pet health', 25, 50),
    ('Energy Drink', 'Medicine', 'Restores pet energy', 15, 30),
    ('Toy Ball', 'Toy', 'Increases pet happiness', 20, 20),
    ('Squeaky Toy', 'Toy', 'Fun toy for pets', 18, 18),
    ('Pet Shampoo', 'Accessory', 'Keeps pets clean and happy', 12, 15),
    ('Vitamin Pills', 'Medicine', 'Boosts pet health over time', 30, 35);

-- Insert default minigames
INSERT INTO Minigame (GameName, Description)
VALUES 
    ('Pet Race', 'Race your pet against others'),
    ('Fetch Game', 'Play fetch with your pet'),
    ('Hide and Seek', 'Find your hidden pet'),
    ('Obstacle Course', 'Navigate through obstacles'),
    ('Memory Game', 'Test your memory with pet patterns');

PRINT 'Database schema created successfully!';
GO
