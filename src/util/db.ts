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
import { PlanetScaleDialect } from 'kysely-planetscale'
import { fetch } from 'undici'
import { Link } from './types/general';
config();

export interface Database {
    faculty: FacultyTable;
    standing: StandingTable;
    role: RoleTable;
    specialization: SpecializationTable;
    person: PersonTable;
    person_role: PersonRoleTable;
    scope: ScopeTable;
    scope_role: ScopeRole;
    team: TeamTable;
    post: PostTable;
}

export function getDatabase() {
    console.log('getDatabase');
    console.log(process.env.DATABASE_USERNAME);
    const db = new Kysely<Database>({
        dialect: new PlanetScaleDialect({
            fetch,
          host: process.env.DATABASE_HOST,
          username: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD
        })
      });      

      return db;
    
}

export interface DictTable<T> {
    id: Generated<number>;
    label: T;
}

export type FacultyTable = DictTable<string>;
export type Faculty = Selectable<FacultyTable>;
export type NewFaculty = Insertable<FacultyTable>;
export type UpdateFaculty = Updateable<FacultyTable>;

export type StandingTable = DictTable<string>;
export type Standing = Selectable<StandingTable>;
export type NewStanding = Insertable<StandingTable>;
export type UpdateStanding = Updateable<StandingTable>;

export type RoleTable = DictTable<string>;
export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type UpdateRole = Updateable<RoleTable>;

export type SpecializationTable = DictTable<string>;
export type Specialization = Selectable<SpecializationTable>;
export type NewSpecialization = Insertable<SpecializationTable>;
export type UpdateSpecialization = Updateable<SpecializationTable>;



export interface PersonTable {
    id: Generated<string>;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
    member_since: Date | null;
}

export interface ProfileTable {
    id: string;
    first_name: string;
    pref_name: string;
    last_name: string;
}

export interface BackgroundTable {
    id: string;
    resume_link: string | null;
    faculty_id: string;
    standing_id: string;
    specialization_id: string;
}

export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type UpdatePerson = Updateable<PersonTable>;

export type Profile = Selectable<ProfileTable>;
export type NewProfile = Insertable<ProfileTable>;
export type UpdateProfile = Updateable<ProfileTable>;

export type Background = Selectable<BackgroundTable>;
export type NewBackground = Insertable<BackgroundTable>;
export type UpdateBackground = Updateable<BackgroundTable>;


export interface PersonRoleTable {
    user_id: string;
    role_id: string;
}

export type PersonRole = Selectable<PersonRoleTable>;
export type NewPersonRole = Insertable<PersonRoleTable>;
export type UpdatePersonRole = Updateable<PersonRoleTable>;

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
    description: string;
    image_link: string | undefined;
    created_at: ColumnType<Date, string | undefined, never>;
    updated_at: ColumnType<Date, string | undefined>;
    meta_data: JSONColumnType<{
        links: Link[];
    }>
}

export type Team = Selectable<TeamTable>;
export type NewTeam = Insertable<TeamTable>;
export type UpdateTeam = Updateable<TeamTable>;

export interface PostTable {
    id: Generated<number>;
    title: string;
    contents: JSONColumnType<{
        body: string;
    }>
    created_at: ColumnType<Date, string | undefined, never>;
    updated_at: ColumnType<Date, string | undefined>;
    teamid: number;
    userid: number;
    status: "pinned" | "default" | "archived" | "bookmarked";
    type : "post" | "event" | "news" | "update" | "announcement" | "discussion";

}

export type Post = Selectable<PostTable>;
export type NewPost = Insertable<PostTable>;
export type UpdatePost = Updateable<PostTable>;