-- Create Area table
CREATE TABLE IF NOT EXISTS Area (
    areaID INT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    accessLevel INT,
    numberOfDocs INT,
    lastUpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    hierarchyLevel INT,
    parentAreaID INT
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS Documents (
    docID INT PRIMARY KEY,
    name VARCHAR(255),
    areaID INT,
    title VARCHAR(255),
    docLink VARCHAR(255),
    lastEditedUser VARCHAR(255),
    creationDate DATE,
    lastUpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (areaID) REFERENCES Area(areaID)
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS Tags (
    tagID INT PRIMARY KEY,
    tagName VARCHAR(255) UNIQUE
);

-- Create junction table to represent the many-to-many relationship between Documents and Tags
CREATE TABLE IF NOT EXISTS DocumentTags (
    docID INT,
    tagID INT,
    PRIMARY KEY (docID, tagID),
    FOREIGN KEY (docID) REFERENCES Documents(docID),
    FOREIGN KEY (tagID) REFERENCES Tags(tagID)
);
