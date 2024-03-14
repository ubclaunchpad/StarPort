-- Generate mock data for Area table
INSERT INTO Area (id, name, description, numberOfDocs, lastUpdatedDate, parentAreaID)
VALUES
    (101, 'Area 1', 'Description for Area 1', 0, CURRENT_TIMESTAMP, 0),
    (102, 'Area 2', 'Description for Area 2', 0, CURRENT_TIMESTAMP, 0),
    (103, '75504261:handbook', 'Description for Area 3', 0, CURRENT_TIMESTAMP, 0);
    -- Add more rows as needed;

-- Generate mock data for Tags table
INSERT INTO Tags (id, tagName)
VALUES
    (1, 'Tag1'),
    (2, 'Tag2'),
    (3, 'Tag3');
    -- Add more rows as needed;

-- Generate mock data for Documents table
INSERT INTO Documents (id, name, areaID, title, docLink, lastEditedUser, creationDate, lastUpdatedDate)
VALUES
    (1, 'Document 1', 101, 'Title 1', 'link1', 'User1', '2024-02-10', CURRENT_TIMESTAMP),
    (2, 'Document 2', 102, 'Title 2', 'link2', 'User2', '2024-02-11', CURRENT_TIMESTAMP),
    (3, 'code-of-conduct', 103, 'Code of Conduct', 'link3', 'User2', '2024-02-11', CURRENT_TIMESTAMP);

    -- Add more rows as needed;

-- Generate mock data for DocumentTags junction table
INSERT INTO DocumentTags (docID, tagID)
VALUES
    (1, 1),
    (1, 2),
    (2, 2),
    (2, 3);
    -- Add more rows as needed;
