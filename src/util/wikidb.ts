import {
    Kysely,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';
import { config } from 'dotenv';
import { PlanetScaleDialect } from 'kysely-planetscale';
// import { fetch as myfetch } from 'undici';
config();

export interface WikiDatabase {
    Area: AreaTable;
    Documents: DocumentsTable;
    Tags: TagsTable;
    DocumentTags: DocumentTagsTable;
}

export function getWikiDatabase() {
    try {
    const db = new Kysely<WikiDatabase>({
        dialect: new PlanetScaleDialect({
            fetch: fetch.prototype,
            host: process.env.WIKI_DATABASE_HOST,
            username: process.env.WIKI_DATABASE_USERNAME,
            password: process.env.WIKI_DATABASE_PASSWORD,
        }),
    });
    // console.log('db:', db);
    console.log('got db');
    return db;
} catch (e) {
    console.log(e);
    throw e;
}
    
}

export interface DictTable<T> {
    id: Generated<number>;
    label: T;
}


export type AreaTable = {
    areaID: number;
    name: string;
    description: string;
    accessLevel: number;
    numberOfDocs: number;
    lastUpdatedDate: Generated<Date>;
    hierarchyLevel: number;
    parentAreaID: number;
};

export type Area = Selectable<AreaTable>;
export type NewArea = Insertable<AreaTable>;
export type UpdateArea = Updateable<AreaTable>;

export type DocumentsTable = {
    docID: Generated<number>;
    name: string;
    areaID: number;
    title: string;
    docLink: string;
    lastEditedUser: string;
    creationDate: Date;
    lastUpdatedDate: Generated<Date>;
};

export type Documents = Selectable<DocumentsTable>;
export type NewDocuments = Insertable<DocumentsTable>;
export type UpdateDocuments = Updateable<DocumentsTable>;

export type TagsTable = DictTable<string>;
export type Tags = Selectable<TagsTable>;
export type NewTags = Insertable<TagsTable>;
export type UpdateTags = Updateable<TagsTable>;

export type DocumentTagsTable = {
    docID: number;
    tagID: number;
};

export type DocumentTags = Selectable<DocumentTagsTable>;
export type NewDocumentTags = Insertable<DocumentTagsTable>;
export type UpdateDocumentTags = Updateable<DocumentTagsTable>;
