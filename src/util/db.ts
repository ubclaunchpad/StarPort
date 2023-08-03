import { Pool } from 'pg';
import {
    Kysely,
    PostgresDialect,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';
import { config } from 'dotenv';
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
}

export function getDatabase() {
    const dialect = new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.MAIN_DATABASE_URL,
            max: 1,
        }),
    });

    return new Kysely<Database>({ dialect });
}

export interface DictTable<T> {
    id: Generated<string>;
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
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    pref_name: string;
    faculty_id: string;
    standing_id: string;
    specialization_id: string;
    created_at: string;
    updated_at: string;
    member_since: Date | null;
    resume_link: string | null;
}

export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type UpdatePerson = Updateable<PersonTable>;

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
