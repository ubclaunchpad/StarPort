-- Create team table
CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('group', 'team', 'other')) DEFAULT 'team',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_link VARCHAR(255),
    meta_data JSON
);

CREATE TABLE IF NOT EXISTS team_term (
    term_year INT NOT NULL,
    teamid INT NOT NULL,
    PRIMARY KEY (term_year, teamid),
    FOREIGN KEY (teamid) REFERENCES team(id) ON DELETE CASCADE
);

-- Create post table
CREATE TABLE IF NOT EXISTS post (
    id SERIAL PRIMARY KEY,
    teamid INT NOT NULL,
    userid INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status TEXT CHECK(status IN ('pinned', 'bookmarked', 'archived', 'default')) DEFAULT 'default',
    type TEXT CHECK(type IN ('event', 'news', 'update','discussion', 'announcement')) DEFAULT 'update',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contents JSON,
    FOREIGN KEY (teamid) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_member (
    teamid INT NOT NULL,
    userid INT NOT NULL,
    team_role TEXT CHECK(team_role IN ('tech lead', 'developer', 'designer', 'design lead', 'other')) DEFAULT 'other',
    member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teamid, userid),
    FOREIGN KEY (teamid) REFERENCES team(id) ON DELETE CASCADE,
    FOREIGN KEY (userid) REFERENCES person(id) ON DELETE CASCADE
);