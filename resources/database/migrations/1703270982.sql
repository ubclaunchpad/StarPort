-- populate pronouns table
INSERT INTO pronouns (label) 
VALUES
    ('He/Him/His'),
    ('She/Her/Hers'),
    ('They/Them/Theirs'),
    ('Ze/Hir/Hirs'),
    ('I do not use a pronoun'),
    ('I use all gender pronouns'),
    ('Other, please ask'); 

-- populate gender table
INSERT INTO gender (label) 
VALUES
    ('Male'),
    ('Female'),
    ('Non-Binary'),
    ("Other");

-- populate ethnicity table
INSERT INTO ethnicity (label) 
VALUES
    ('Indigenous'),
    ('Caucasian / White'),
    ('African / Black'),
    ('East Asian'),
    ('South Asian'),
    ('Southeast Asian'),
    ('Middle Eastern'),
    ('Latin American / Hispanic'),
    ('Caribbean'),
    ('Other');


-- populate faculty table
INSERT INTO faculty (label) 
VALUES
    ('Forestry'),
    ('Land and Food Systems'),
    ('Education'),
    ('Business'),
    ('Arts'),
    ('Applied Science'),
    ('Science'),
    ('Medicine'),
    ('Other');

-- populate standing table
INSERT INTO standing (label) 
VALUES 
    ('First Year'),
    ('Second Year'),
    ('Third Year'),
    ('Fourth Year and up'),
    ('Graduate Student'),
    ('Alumni'),
    ('Other');

-- populate specialization table
INSERT INTO specialization (label)
VALUES
  ('Accounting'),
  ('African Studies'),
  ('American Studies'),
  ('Anthropology'),
  ('Archaeology'),
  ('Art History'),
  ('Asian Studies'),
  ('Astronomy'),
  ('Biochemistry'),
  ('Biology'),
  ('Biomedical Engineering'),
  ('Business Administration'),
  ('Canadian Studies'),
  ('Chemistry'),
  ('Chinese Studies'),
  ('Civil Engineering'),
  ('Classics'),
  ('Cognitive Systems: Computational Intelligence and Design'),
  ('Communication'),
  ('Computer Science'),
  ('Conservation and Restoration of Cultural Property'),
  ('Criminology'),
  ('Development Studies'),
  ('Economics'),
  ('Education'),
  ('Electrical and Computer Engineering'),
  ('English'),
  ('Environmental Engineering'),
  ('Environmental Sciences'),
  ('European Studies'),
  ('Film and Media Studies'),
  ('Finance'),
  ('French Studies'),
  ('Geography'),
  ('Germanic and Slavic Studies'),
  ('Global Studies'),
  ('History'),
  ('Human Geography'),
  ('Information Technology'),
  ('International Business'),
  ('International Relations'),
  ('Italian Studies'),
  ('Japanese Studies'),
  ('Jewish Studies'),
  ('Latin American Studies'),
  ('Law'),
  ('Linguistics'),
  ('Management'),
  ('Marketing'),
  ('Mathematics'),
  ('Mechanical Engineering'),
  ('Media Studies'),
  ('Microbiology'),
  ('Middle Eastern Studies'),
  ('Molecular Biology and Biochemistry'),
  ('Music'),
  ('Natural Resources Economics'),
  ('Neuroscience'),
  ('Nursing'),
  ('Philosophy'),
  ('Physics'),
  ('Political Science'),
  ('Psychology'),
  ('Public Policy'),
  ('Religious Studies'),
  ('Romance Languages and Literatures'),
  ('Russian and East European Studies'),
  ('Science'),
  ('Sociology'),
  ('Spanish and Portuguese Studies'),
  ('Statistics'),
  ('Sustainability'),
  ('Theatre'),
  ('Urban Planning'),
  ('Other');

-- populate role table
INSERT INTO role (label)
VALUES
    ('Admin'),
    ('Lead'),
    ('Member');

-- populate scope table
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

-- populate scope_role table
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