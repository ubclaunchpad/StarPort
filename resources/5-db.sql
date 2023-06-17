-- Active: 1684354600598@@lp-serverless-instance-1.cfooabqxr9fc.us-west-2.rds.amazonaws.com@3306@main
-- create auth integration TABLE
CREATE TABLE auth_integration (
    name VARCHAR(255) PRIMARY KEY
);

-- populate auth integration table
INSERT INTO auth_integration (name) VALUES 
('Google'),
('Facebook'),
('Discord'),
('Figma'),
('Github'),
('Slack'),
('LinkedIn');

-- create user auth TABLE
CREATE TABLE user_auth (
    user_id INT NOT NULL,
    auth_integration_name VARCHAR(255) NOT NULL,
    hash_token VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, auth_integration_name),
    FOREIGN KEY (auth_integration_name) REFERENCES auth_integration(name) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES person(user_id) ON DELETE CASCADE
);

