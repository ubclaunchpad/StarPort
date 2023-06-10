-- Active: 1684354600598@@lp-serverless-instance-1.cfooabqxr9fc.us-west-2.rds.amazonaws.com@3306@main
-- Create a stored procedure
DELIMITER //

CREATE PROCEDURE drop_foreign_key_constraint(
  IN table_name VARCHAR(100),
  IN constraint_name VARCHAR(100)
)
BEGIN
  SET @query = CONCAT(
    'SELECT COUNT(*) INTO @constraint_exists FROM information_schema.key_column_usage ',
    'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = \'', table_name, '\' ',
    'AND CONSTRAINT_NAME = \'', constraint_name, '\''
  );
  
  PREPARE stmt FROM @query;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  IF @constraint_exists THEN
    SET @alter_query = CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name);
    
    PREPARE stmt FROM @alter_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //

DELIMITER ;

-- Drop foreign key constraints using the stored procedure
CALL drop_foreign_key_constraint('person_degree_program', 'person_degree_program_ibfk_1');
CALL drop_foreign_key_constraint('person_pronoun', 'person_pronoun_ibfk_1');
CALL drop_foreign_key_constraint('person_gender', 'person_gender_ibfk_1');
CALL drop_foreign_key_constraint('person_ethnicity', 'person_ethnicity_ibfk_1');
CALL drop_foreign_key_constraint('file', 'file_ibfk_1');
CALL drop_foreign_key_constraint('person', 'person_ibfk_1');

-- Drop tables in reverse order
DROP TABLE IF EXISTS person_degree_program;
DROP TABLE IF EXISTS degree_program;
DROP TABLE IF EXISTS person_pronoun;
DROP TABLE IF EXISTS pronoun;
DROP TABLE IF EXISTS person_gender;
DROP TABLE IF EXISTS gender;
DROP TABLE IF EXISTS person_ethnicity;
DROP TABLE IF EXISTS ethnicity;
DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS standing;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS person_role;


-- Create the faculty table
CREATE TABLE faculty (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_name VARCHAR(100)
);

-- Create the degree_program table
CREATE TABLE degree_program (
  program_id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(100)
);

CREATE TABLE standing (
  standing_id INT AUTO_INCREMENT PRIMARY KEY,
  standing_name VARCHAR(100)
);


-- Create the person table
CREATE TABLE person (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  pref_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  resumelink VARCHAR(50),
  faculty_id INT NOT NULL,
  standing_id INT NOT NULL,
  FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id),
  FOREIGN KEY (standing_id) REFERENCES standing (standing_id)
);

-- Create Standing table

-- Create Launchpad tech role table
CREATE TABLE role (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100)
);

-- Create the person_role table
CREATE TABLE person_role (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES role (role_id) ON DELETE CASCADE
);

-- Create the person_degree_program table
CREATE TABLE person_degree_program (
  user_id INT,
  program_id INT,
  PRIMARY KEY (user_id, program_id),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES degree_program (program_id) ON DELETE CASCADE
);

-- Create the pronoun table
CREATE TABLE pronoun (
  pronoun_id INT AUTO_INCREMENT PRIMARY KEY,
  pronoun_name VARCHAR(50)
);

-- Create the person_pronoun table
CREATE TABLE person_pronoun (
  user_id INT,
  pronoun_id INT,
  PRIMARY KEY (user_id, pronoun_id),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
  FOREIGN KEY (pronoun_id) REFERENCES pronoun (pronoun_id) ON DELETE CASCADE
);

-- Create the gender table
CREATE TABLE gender (
  gender_id INT AUTO_INCREMENT PRIMARY KEY,
  gender_name VARCHAR(50)
);

-- Create the person_gender table
CREATE TABLE person_gender (
  user_id INT,
  gender_id INT,
  PRIMARY KEY (user_id, gender_id),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
  FOREIGN KEY (gender_id) REFERENCES gender (gender_id) ON DELETE CASCADE
);

-- Create the ethnicity table
CREATE TABLE ethnicity (
  ethnicity_id INT AUTO_INCREMENT PRIMARY KEY,
  ethnicity_name VARCHAR(50)
);

-- Create the person_ethnicity table
CREATE TABLE person_ethnicity (
  user_id INT,
  ethnicity_id INT,
  PRIMARY KEY (user_id, ethnicity_id),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE,
  FOREIGN KEY (ethnicity_id) REFERENCES ethnicity (ethnicity_id) ON DELETE CASCADE
);

-- Create the file table
CREATE TABLE file (
  file_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  file_name VARCHAR(100),
  file_url VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES person (user_id) ON DELETE CASCADE
);
