--create social platforms TABLE
CREATE TABLE IF NOT EXISTS social_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE
);

--create user_social_media TABLE
CREATE TABLE IF NOT EXISTS person_social_media (
    user_id INT,
    social_media_id INT,
    url VARCHAR(255) NOT NULL,
    handle VARCHAR(255),
    PRIMARY KEY (user_id, social_media_id),
    FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
    FOREIGN KEY (social_media_id) REFERENCES social_media (id) ON DELETE CASCADE
);


-- insert starter social media 
INSERT INTO social_media (name, domain) VALUES
('GitHub', 'github.com'),
('Facebook', 'facebook.com'),
('Instagram', 'instagram.com'),
('LinkedIn', 'linkedin.com'),
('Twitter', 'twitter.com'),
('Website', NULL),
('Figma', 'figma.com'),
('Other', NULL);


-- create email column index for person TABLE
CREATE INDEX email_index ON person (email);