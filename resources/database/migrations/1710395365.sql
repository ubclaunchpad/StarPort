-- Create Area table
CREATE TABLE IF NOT EXISTS area (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255),
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parent_areaid INT DEFAULT NULL,
    Foreign Key (parent_areaid) references area(id) ON DELETE NO ACTION
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    areaid INT,
    title VARCHAR(500),
    doclink VARCHAR(2000),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Foreign Key (areaid) references area(id) ON DELETE CASCADE
);