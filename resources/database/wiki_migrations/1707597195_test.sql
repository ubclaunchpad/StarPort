-- Create Area table
CREATE TABLE IF NOT EXISTS Area (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    numberOfDocs INT,
    lastUpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parentAreaID INT
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    areaID INT,
    title VARCHAR(255),
    docLink VARCHAR(255),
    lastEditedUser VARCHAR(255),
    creationDate DATE,
    lastUpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (areaID) REFERENCES Area(id)
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tagName VARCHAR(255) UNIQUE
);

-- Create junction table to represent the many-to-many relationship between Documents and Tags
CREATE TABLE IF NOT EXISTS DocumentTags (
    docID INT,
    tagID INT,
    PRIMARY KEY (docID, tagID),
    FOREIGN KEY (docID) REFERENCES Documents(id),
    FOREIGN KEY (tagID) REFERENCES Tags(id)
);
