import {
    Kysely,
    Generated,
    Insertable,
    Selectable,
    Updateable,
    ColumnType,
    JSONColumnType,
} from 'kysely';
import { config } from 'dotenv';
import { PlanetScaleDialect } from 'kysely-planetscale';
import { Link } from './types/general';
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
    team_term: TeamTermTable;
    post: PostTable;
    team_member: team_member;
    area: AreaTable;
    document: DocumentsTable;
    user_scopes_view: UserScopesViewTable;
}

export function getDatabase() {
    const db = new Kysely<Database>({
        dialect: new PlanetScaleDialect({
            host: process.env.DATABASE_HOST,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
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

export type DocumentsTable = {
    id: Generated<number>;
    areaid: number;
    title: string;
    doclink?: string;
    createdat: Generated<Date>;
    updatedat: Generated<Date>;
};

export type Documents = Selectable<DocumentsTable>;
export type NewDocuments = Insertable<DocumentsTable>;
export type UpdateDocuments = Updateable<DocumentsTable>;

export interface UserScopesViewTable {
    email: string;
    scope_label: string;
}

export type UserScopesView = Selectable<UserScopesViewTable>;
export type NewUserScopesView = Insertable<UserScopesViewTable>;
export type UpdateUserScopesView = Updateable<UserScopesViewTable>;
