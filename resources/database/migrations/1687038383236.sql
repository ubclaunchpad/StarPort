-- Create the faculty table
CREATE TABLE IF NOT EXISTS faculty (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the standing table
CREATE TABLE IF NOT EXISTS standing (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the role table
CREATE TABLE IF NOT EXISTS role (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the specialization table
CREATE TABLE IF NOT EXISTS specialization (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the gender table
CREATE TABLE IF NOT EXISTS gender (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the pronoun table
CREATE TABLE IF NOT EXISTS pronoun (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the ethnicity table
CREATE TABLE IF NOT EXISTS ethnicity (
id INT AUTO_INCREMENT PRIMARY KEY,
label VARCHAR(100) UNIQUE NOT NULL
);

-- CREATE the profile table
CREATE TABLE IF NOT EXISTS profile (
id INT PRIMARY KEY,
first_name VARCHAR(255) NOT NULL,
pref_name VARCHAR(255) NOT NULL,
last_name VARCHAR(255) NOT NULL
);

-- Create the background table
CREATE TABLE IF NOT EXISTS background (
id INT PRIMARY KEY,
resume_link VARCHAR(255),
faculty_id INT NOT NULL,
standing_id INT NOT NULL,
specialization_id INT NOT NULL
);

-- Create the account table
CREATE TABLE IF NOT EXISTS person (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) UNIQUE NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
member_since TIMESTAMP NULL DEFAULT NULL
);

-- Create the person_role table
CREATE TABLE IF NOT EXISTS person_role (
user_id INT,
role_id INT,
PRIMARY KEY (user_id, role_id)
);

-- Create the person_pronoun table
CREATE TABLE IF NOT EXISTS person_pronoun (
user_id INT,
pronoun_id INT,
PRIMARY KEY (user_id, pronoun_id)
);

-- Create the person_gender table
CREATE TABLE IF NOT EXISTS person_gender (
user_id INT,
gender_id INT,
PRIMARY KEY (user_id, gender_id)
);

-- Create the person_ethnicity table
CREATE TABLE IF NOT EXISTS person_ethnicity (
user_id INT,
ethnicity_id INT,
PRIMARY KEY (user_id, ethnicity_id)
);