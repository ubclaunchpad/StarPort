-- Create the scope table
CREATE TABLE IF NOT EXISTS scope (
    label VARCHAR(100) PRIMARY KEY,
    description VARCHAR(255)
);

-- Create the role table
CREATE TABLE IF NOT EXISTS role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL
);

-- Create the scope_role table
CREATE TABLE IF NOT EXISTS scope_role (
    scope_label VARCHAR(100),
    role_label VARCHAR(100),
    PRIMARY KEY (scope_label, role_label)
);

-- -- populate scope table
INSERT INTO scope (label, description)
VALUES
    ('read:admin', 'Admin full read access'),
    ('read:profile:all', 'Read all data of profiles'),
    ('read:profile:restricted', 'Read certain data of profiles'),
    ('read:profile:personal', 'Read all data to your own profile'),
    ('write:admin', 'Admin full write access'),
    ('write:profile', 'Write all data of profiles'),
    ('update:admin', 'Admin full update access'),
    ('update:profile:all', 'Update all data of profiles'),
    ('update:profile:personal', 'Update all data to your own profile'),
    ('delete:admin', 'Admin full delete access'),
    ('delete:profile:all', 'Delete all data of profiles'),
    ('delete:profile:personal', 'Delete all data to your own profile');

-- -- populate role table
INSERT INTO role (label)
VALUES
    ('Admin'),
    ('Lead'),
    ('Member');

-- -- populate scope_role table
INSERT INTO scope_role (scope_label, role_label)
VALUES
    ('read:admin', 'Admin'),
    ('write:admin', 'Admin'),
    ('update:admin', 'Admin'),
    ('delete:admin', 'Admin'),
    ('read:profile:all', 'Lead'),
    ('write:profile:all', 'Lead'),
    ('update:profile:all', 'Lead'),
    ('delete:profile:all', 'Lead'),
    ('read:profile:personal', 'Member'),
    ('read:profile:restricted', 'Member'),
    ('update:profile:personal', 'Member'),
    ('delete:profile:personal', 'Member');

