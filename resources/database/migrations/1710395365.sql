-- Create Area table
CREATE TABLE IF NOT EXISTS area (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_areaid INT DEFAULT NULL,
    FOREIGN KEY (parent_areaid) REFERENCES area(id) ON DELETE NO ACTION
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS document (
    id SERIAL PRIMARY KEY,
    areaid INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    fileid VARCHAR(500) NOT NULL UNIQUE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (areaid) REFERENCES area(id) ON DELETE CASCADE
);


-- Create collection table
CREATE TABLE IF NOT EXISTS collection (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description VARCHAR(500),
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create collection_item table
CREATE TABLE IF NOT EXISTS collection_item (
    collectionid INT NOT NULL,
    itemid INT NOT NULL,
    itemtype VARCHAR(10) NOT NULL CHECK (itemtype IN ('area', 'document')),
    PRIMARY KEY (collectionid, itemid, itemtype),
    FOREIGN KEY (collectionid) REFERENCES collection(id) ON DELETE CASCADE
);


-- Create team_collection table
CREATE TABLE IF NOT EXISTS team_collection (
    teamid INT NOT NULL,
    collectionid INT NOT NULL,
    PRIMARY KEY (teamid, collectionid),
    FOREIGN KEY (teamid) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (collectionid) REFERENCES collection(id) ON DELETE CASCADE
);