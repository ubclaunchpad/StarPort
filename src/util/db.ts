import {
    Kysely,
    Generated,
    Insertable,
    Selectable,
    Updateable,
    ColumnType,
    JSONColumnType,
    PostgresDialect,
} from 'kysely';
import { config } from 'dotenv';
import { Link } from './types/general';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

config();

export interface Database {
    ethnicity: ResourceTable;
    faculty: ResourceTable;
    gender: ResourceTable;
    person: PersonTable;
    person_role: PersonRoleTable;
    pronouns: ResourceTable;
    role: RoleTable;
    scope: ScopeTable;
    scope_role: ScopeRole;
    specialization: ResourceTable;
    standing: ResourceTable;
    team: TeamTable;
    post: PostTable;
    team_member: team_member;
    area: AreaTable;
    document: DocumentTable;
    user_scopes_view: UserScopesViewTable;
    collection: CollectionTable;
    collection_item: CollectionItemTable;
    team_collection: TeamCollectionTable;
}

export function getDatabase() {
    const db = new Kysely<Database>({
        dialect: new PostgresJSDialect({
            postgres: postgres({
                // max: 20,
                database: process.env.DATABASE_NAME,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
            }),
        }),
    });

    return db;
}

export interface DictTable<T> {
    id: Generated<number>;
    label: T;
}

export type ResourceTable = DictTable<string>;
export type Resource = Selectable<ResourceTable>;
export type NewResource = Insertable<ResourceTable>;
export type UpdateResource = Updateable<ResourceTable>;

export type RoleTable = DictTable<string>;
export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type UpdateRole = Updateable<RoleTable>;

export interface ScopeTable {
    label: string;
    description: string;
}

export type Scope = Selectable<ScopeTable>;
export type NewScope = Insertable<ScopeTable>;
export type UpdateScope = Updateable<ScopeTable>;

export interface ScopeRoleTable {
    role_label: string;
    scope_label: string;
}

export type ScopeRole = Selectable<ScopeRoleTable>;
export type NewScopeRole = Insertable<ScopeRoleTable>;
export type UpdateScopeRole = Updateable<ScopeRole>;
export interface TeamTable {
    id: Generated<number>;
    label: string;
    type: 'group' | 'project' | 'other';
    description: string;
    image_link: string | undefined;
    created_at: ColumnType<Date, string | undefined, never>;
    updated_at: ColumnType<Date, string | undefined>;
    meta_data: JSONColumnType<{
        links: Link[];
    }>;
    year: number;
}

export type Team = Selectable<TeamTable>;
export type NewTeam = Insertable<TeamTable>;
export type UpdateTeam = Updateable<TeamTable>;

export interface TeamTermTable {
    teamid: number;
    term_year: number;
}

export type TeamTerm = Selectable<TeamTermTable>;
export type NewTeamTerm = Insertable<TeamTermTable>;
export type UpdateTeamTerm = Updateable<TeamTermTable>;

export interface PostTable {
    id: Generated<number>;
    title: string;
    contents: JSONColumnType<{
        body: string;
    }>;
    created_at: ColumnType<Date, string | undefined, never>;
    updated_at: ColumnType<Date, string | undefined>;
    teamid: number;
    userid: number;
    status: 'pinned' | 'default' | 'archived' | 'bookmarked';
    type: 'post' | 'event' | 'news' | 'update' | 'announcement' | 'discussion';
}

export type Post = Selectable<PostTable>;
export type NewPost = Insertable<PostTable>;
export type UpdatePost = Updateable<PostTable>;

export interface PersonTable {
    id: Generated<number>;
    email: string;
    member_since: Date;
    account_updated: Date;
    person_role_id: Generated<number>;
    first_name: string;
    pref_name: string;
    last_name: string;
    pronouns_id: Generated<number>;
    gender_id: Generated<number>;
    ethnicity_id: Generated<number>;
    faculty_id: Generated<number>;
    standing_id: Generated<number>;
    specialization_id: Generated<number>;
    student_number: string;
    phone_number: string;
    linkedin_link: string;
    github_link: string;
    website_link: string;
    resume_link: string;
}

export interface PersonRoleTable {
    person_id: number;
    role_id: number;
}

export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type UpdatePerson = Updateable<PersonTable>;

export interface team_member {
    teamid: number;
    userid: number;
    team_role: 'tech lead';
    designer;
    developer;
    'design lead';
    other;
}

export type TeamMember = Selectable<team_member>;
export type NewTeamMember = Insertable<team_member>;
export type UpdateTeamMember = Updateable<team_member>;

export type AreaTable = {
    id: Generated<number>;
    name: string;
    description: string;
    parent_areaid: number;
    updatedat: Generated<Date>;
};

export type Area = Selectable<AreaTable>;
export type NewArea = Insertable<AreaTable>;
export type UpdateArea = Updateable<AreaTable>;

export type DocumentTable = {
    id: Generated<number>;
    areaid: number;
    title: string;
    fileid: string;
    createdat: Generated<Date>;
    updatedat: Generated<Date>;
};

export type Document = Selectable<DocumentTable>;
export type NewDocument = Insertable<DocumentTable>;
export type UpdateDocument = Updateable<DocumentTable>;

export interface UserScopesViewTable {
    email: string;
    scope_label: string;
}

export type UserScopesView = Selectable<UserScopesViewTable>;
export type NewUserScopesView = Insertable<UserScopesViewTable>;
export type UpdateUserScopesView = Updateable<UserScopesViewTable>;

export interface CollectionTable {
    id: Generated<number>;
    name: string;
    description: string;
    updated_at: ColumnType<Date, string | undefined>;
}

export type Collection = Selectable<CollectionTable>;
export type NewCollection = Insertable<CollectionTable>;
export type UpdateCollection = Updateable<CollectionTable>;

export interface CollectionItemTable {
    collectionid: number;
    itemid: number;
    itemtype: string;
}

export type CollectionItem = Selectable<CollectionItemTable>;
export type NewCollectionItem = Insertable<CollectionItemTable>;
export type UpdateCollectionItem = Updateable<CollectionItemTable>;

export interface TeamCollectionTable {
    teamid: number;
    collectionid: number;
}

export type TeamCollection = Selectable<TeamCollectionTable>;
export type NewTeamCollection = Insertable<TeamCollectionTable>;
export type UpdateTeamCollection = Updateable<TeamCollectionTable>;
