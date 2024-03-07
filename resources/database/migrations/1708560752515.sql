-- Active: 1700618524251@@aws.connect.psdb.cloud@3306
-- Team feature SQL SCHEMA

-- Create team table
CREATE TABLE IF NOT EXISTS team (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL,
description VARCHAR(255),
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
image_link VARCHAR(255),
meta_data JSON
);

-- Create post table
CREATE TABLE IF NOT EXISTS post (
id INT AUTO_INCREMENT PRIMARY KEY,
teamid INT NOT NULL,
userid INT NOT NULL,
title VARCHAR(255) NOT NULL,
status ENUM('pinned', 'bookmarked', 'archived', 'default') DEFAULT 'default',
type ENUM('post', 'event', 'news', 'update','discussion', 'anouncement') DEFAULT 'announcement',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
contents JSON,
FOREIGN KEY (`teamid`) REFERENCES `team` (`id`)
FOREIGN KEY (`userid`) REFERENCES `person` (`id`)
);