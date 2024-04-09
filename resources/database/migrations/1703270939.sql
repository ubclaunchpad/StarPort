-- Create the pronoun table
CREATE TABLE IF NOT EXISTS pronouns (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the gender table
CREATE TABLE IF NOT EXISTS gender (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the ethnicity table
CREATE TABLE IF NOT EXISTS ethnicity (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the standing table
CREATE TABLE IF NOT EXISTS standing (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the specialization table
CREATE TABLE IF NOT EXISTS specialization (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS person_role (
    person_id INT,
    role_id INT,
    PRIMARY KEY (person_id, role_id)
);

-- Create the role table
CREATE TABLE IF NOT EXISTS role (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the scope table
CREATE TABLE IF NOT EXISTS scope (
    label VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255)
);

-- Create the scope_role table
CREATE TABLE IF NOT EXISTS scope_role (
    scope_label VARCHAR(100),
    role_label VARCHAR(100),
    PRIMARY KEY (scope_label, role_label)
);

-- Create the person table
CREATE TABLE IF NOT EXISTS person (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(255) NOT NULL,
    pref_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    pronouns_id INT,
    gender_id INT,
    ethnicity_id INT,
    faculty_id INT,
    standing_id INT,
    specialization_id INT,
    student_number VARCHAR(255),
    phone_number VARCHAR(255),
    linkedin_link VARCHAR(255),
    github_link VARCHAR(255),
    website_link VARCHAR(255),
    resume_link VARCHAR(255)
);