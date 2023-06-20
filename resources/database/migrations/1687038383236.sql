-- Script to set up the database for Launch Pad Portal

-- Create the faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the standing table
CREATE TABLE IF NOT EXISTS standing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the role table
CREATE TABLE IF NOT EXISTS role (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the specialization table
CREATE TABLE IF NOT EXISTS specialization (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the gender table
CREATE TABLE IF NOT EXISTS gender (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the pronoun table
CREATE TABLE IF NOT EXISTS pronoun (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the ethnicity table
CREATE TABLE IF NOT EXISTS ethnicity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Create the person table
CREATE TABLE IF NOT EXISTS person (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  pref_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL DEFAULT (email),
  resumelink VARCHAR(100),
  faculty_id INT NOT NULL,
  standing_id INT  NOT NULL,
  specialization_id INT NOT NULL,
  FOREIGN KEY (faculty_id) REFERENCES faculty (id),
  FOREIGN KEY (standing_id) REFERENCES standing (id),
  FOREIGN KEY (specialization_id) REFERENCES specialization (id)
);

-- Create the person_role table
CREATE TABLE IF NOT EXISTS person_role (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the person_pronoun table
CREATE TABLE IF NOT EXISTS person_pronoun (
  user_id INT,
  pronoun_id INT,
  PRIMARY KEY (user_id, pronoun_id),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (pronoun_id) REFERENCES pronoun (id)ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the person_gender table
CREATE TABLE IF NOT EXISTS person_gender (
  user_id INT,
  gender_id INT,
  PRIMARY KEY (user_id, gender_id),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (gender_id) REFERENCES gender (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the person_ethnicity table
CREATE TABLE IF NOT EXISTS person_ethnicity (
  user_id INT,
  ethnicity_id INT,
  PRIMARY KEY (user_id, ethnicity_id),
  FOREIGN KEY (user_id) REFERENCES person (id) ON DELETE CASCADE,
  FOREIGN KEY (ethnicity_id) REFERENCES ethnicity (id) ON DELETE CASCADE ON UPDATE CASCADE
);
