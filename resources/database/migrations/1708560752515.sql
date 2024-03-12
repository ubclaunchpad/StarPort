-- Active: 1700618524251@@aws.connect.psdb.cloud@3306
-- Team feature SQL SCHEMA

-- Create team table
CREATE TABLE IF NOT EXISTS team (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL,
type ENUM('group', 'team', 'other') DEFAULT 'team',
description TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
image_link VARCHAR(255),
meta_data JSON
);

CREATE TABLE IF NOT EXISTS team_term (
    term_year INT NOT NULL,
    teamid INT NOT NULL,
    PRIMARY KEY (term_year, teamid) 
);


-- Create post table
CREATE TABLE IF NOT EXISTS post (
id INT AUTO_INCREMENT PRIMARY KEY,
teamid INT NOT NULL,
userid INT NOT NULL,
title VARCHAR(255) NOT NULL,
status ENUM('pinned', 'bookmarked', 'archived', 'default') DEFAULT 'default',
type ENUM( 'event', 'news', 'update','discussion', 'announcement') DEFAULT 'update',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
contents JSON
);

CREATE TABLE IF NOT EXISTS team_member (
    teamid INT NOT NULL,
    userid INT NOT NULL,
    team_role ENUM('tech lead', 'developer', 'designer', 'design lead', 'other') DEFAULT 'other',
    member_since DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teamid, userid)
);


