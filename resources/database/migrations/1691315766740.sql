-- Project status table
CREATE TABLE project_status (
    label varchar(100) primary key,
    description varchar(255)
);

-- Project table
CREATE TABLE project (
    title VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status varchar(100) REFERENCES project_status(label) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Resource type table
CREATE TABLE resource_type (
    label VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255),
    link VARCHAR(255) NOT NULL UNIQUE
);

-- Project resource table
CREATE TABLE project_resource (
    project_title VARCHAR(100) REFERENCES project(title) ON DELETE CASCADE ON UPDATE CASCADE,
    resource_type VARCHAR(100) REFERENCES resource_type(label) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (project_title, resource_type)
);

-- Project Role table
CREATE TABLE project_role (
    label VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255)
);

-- Project person table
CREATE TABLE project_person (
    project_title VARCHAR(100) REFERENCES project(title) ON DELETE CASCADE ON UPDATE CASCADE,
    person_id INTEGER REFERENCES person(id) ON DELETE CASCADE ON UPDATE CASCADE,
    role VARCHAR(100) REFERENCES project_role(label) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (project_title, person_id)
);



