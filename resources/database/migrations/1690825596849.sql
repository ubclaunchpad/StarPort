-- Create the scope table
CREATE TABLE IF NOT EXISTS scope (
label VARCHAR(100) PRIMARY KEY,
description VARCHAR(255)
);

-- Create the scope_role table
CREATE TABLE IF NOT EXISTS scope_role (
scope_label VARCHAR(100),
role_label VARCHAR(100),
PRIMARY KEY (scope_label, role_label),
FOREIGN KEY (scope_label) REFERENCES scope (label) ON DELETE CASCADE,
FOREIGN KEY (role_label) REFERENCES role (label) ON DELETE CASCADE ON UPDATE CASCADE
);

-- populate scope table
INSERT INTO scope (label, description) VALUES ('admin:read', 'Admin full read access');
INSERT INTO scope (label, description) VALUES ('admin:write', 'Admin full write access');
INSERT INTO scope (label, description) VALUES ('admin:write:limited', 'can write most things, but not all');
INSERT INTO scope (label, description) VALUES ('profile:read:others', 'can read other profiles. When/if user is blocked/restricted the access can be revoked.');
INSERT INTO scope (label, description) VALUES ('profile:write:others', 'can update and delete other profiles');
INSERT INTO scope (label, description) VALUES ('profile:write:others:limited', 'can only update other profiles, but not delete');

-- populate scope_role table
INSERT INTO scope_role (scope_label, role_label)
VALUES
    ('profile:read:others', 'Tech Lead'),
    ('profile:read:others', 'Design Lead'),
    ('profile:read:others', 'Co-pres'),
    ('admin:read', 'Co-pres'),
    ('admin:write', 'Co-pres'),
    ('profile:write:others', 'Tech Lead'),
    ('profile:write:others', 'Design Lead'),
    ('profile:write:others', 'Co-pres');




