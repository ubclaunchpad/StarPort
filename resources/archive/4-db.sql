
-- posting for project TABLE
CREATE TABLE posting (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    link VARCHAR(255),
    project_role_id INT NOT NULL,
    project_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);


-- Application status TABLE
CREATE TABLE application_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(255) NOT NULL UNIQUE
);

-- populate application status table
INSERT INTO application_status (status) VALUES 
('Submitted'),
('Under Review'),
('Interviewing'),
('Offered'),
('Waitlisted'),
('Declined'),
('Accepted'),
('Rejected'),
('Withdrawn');

-- application table
CREATE TABLE application (
    posting_id INT NOT NULL,
    email VARCHAR(100)  NOT NULL,
    PRIMARY KEY (email, posting_id),
    resume_link VARCHAR(255) NOT NULL,
    application_status_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    pref_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    faculty_id INT NOT NULL,
    standing_id INT NOT NULL,
    pronoun_id INT,
    gender_id INT,
    ethnicity_id INT,
    program_id INT,
    FOREIGN KEY (program_id) REFERENCES degree_program (program_id) ON UPDATE CASCADE,
    FOREIGN KEY (gender_id) REFERENCES gender (gender_id) ON UPDATE CASCADE,
    FOREIGN KEY (ethnicity_id) REFERENCES ethnicity (ethnicity_id) ON UPDATE CASCADE,
    FOREIGN KEY (pronoun_id) REFERENCES pronoun (pronoun_id) ON UPDATE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id) ON UPDATE CASCADE,
    FOREIGN KEY (standing_id) REFERENCES standing (standing_id) ON UPDATE CASCADE,
    FOREIGN KEY (application_status_id) REFERENCES application_status(id) ON DELETE CASCADE,
    FOREIGN KEY (posting_id) REFERENCES posting(id) ON DELETE CASCADE
);