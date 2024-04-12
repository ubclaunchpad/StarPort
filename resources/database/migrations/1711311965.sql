CREATE VIEW user_scopes_view AS
SELECT 
    person.email, 
    scope_role.scope_label
FROM 
    scope_role
INNER JOIN role ON role.label = scope_role.role_label
INNER JOIN person_role ON person_role.role_id = role.id
INNER JOIN person ON person.id = person_role.person_id;

