-- Project Status table
CREATE TABLE project_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(255) NOT NULL UNIQUE
);


-- Project table
CREATE TABLE project (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status_id INT,
    FOREIGN KEY (status_id) REFERENCES project_status(id) ON DELETE CASCADE
);




-- project role table (Many-to-Many Relationship)
CREATE TABLE project_role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

-- alter project tbale to make roleid AUTO_INCREMENT
ALTER TABLE project_role MODIFY COLUMN role_id INT AUTO_INCREMENT;


-- Project User table (Many-to-Many Relationship)
CREATE TABLE project_person (
    project_id INT,
    user_id INT,
    role_id INT,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES person(user_id) ON DELETE CASCADE
);

-- Resource Type TABLE
CREATE TABLE resource_type (
    type VARCHAR(255) PRIMARY KEY  NOT NULL
);

-- Resources TABLE
CREATE TABLE resource (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(255) NOT NULL UNIQUE,
    type_id VARCHAR(255),
    FOREIGN KEY (type_id) REFERENCES resource_type(type) ON DELETE CASCADE
);


-- Project Resource table (Many-to-Many Relationship)
CREATE TABLE project_resource (
    project_id INT,
    resource_id INT,
    PRIMARY KEY (project_id, resource_id),
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resource(id) ON DELETE CASCADE
);


-- populate resource type table
INSERT INTO resource_type (type) VALUES 
('Youtube'),
('Github'),
('Cloud Document'),
('Figma'),
('Other'),
('Website'),
('Link');

-- populate project status table
INSERT INTO project_status (status) VALUES 
('Planning'),
('Not Started'),
('Awaiting Approval'),
('On Hold'),
('In Development'),
('In Review'),
('Awaiting Feedback'),
('Completed'),
('Archived'),
('Other');


-- populate project role table
INSERT INTO project_role (role_name) VALUES 
('Tech Lead'),
('Product Manager'),
('Product Owner'),
('Developer'),
('Designer'),
('Tester'),
('Stakeholder'),
('Other');

