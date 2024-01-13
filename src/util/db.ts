import {
    Kysely,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';
import { config } from 'dotenv';
import { PlanetScaleDialect } from 'kysely-planetscale'
import { fetch } from 'undici'
config();

export interface Database {
    ethnicity: EthnicityTable;
    faculty: FacultyTable;
    gender: GenderTable;
    person: PersonTable;
    pronouns: PronounsTable;
    role: RoleTable;
    scope: ScopeTable;
    scope_role: ScopeRole;
    specialization: SpecializationTable;
    standing: StandingTable;
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

export type EthnicityTable = DictTable<string>;
export type Ethnicity = Selectable<EthnicityTable>;
export type NewEthnicity = Insertable<EthnicityTable>;
export type UpdateEthnicity = Updateable<EthnicityTable>;

export type FacultyTable = DictTable<string>;
export type Faculty = Selectable<FacultyTable>;
export type NewFaculty = Insertable<FacultyTable>;
export type UpdateFaculty = Updateable<FacultyTable>;

export type GenderTable = DictTable<string>;
export type Gender = Selectable<GenderTable>;
export type NewGender = Insertable<GenderTable>;
export type UpdateGender = Updateable<GenderTable>;

export type PronounsTable = DictTable<string>;
export type Pronouns = Selectable<PronounsTable>;
export type NewPronouns = Insertable<PronounsTable>;
export type UpdatePronouns = Updateable<PronounsTable>;

export type StandingTable = DictTable<string>;
export type Standing = Selectable<StandingTable>;
export type NewStanding = Insertable<StandingTable>;
export type UpdateStanding = Updateable<StandingTable>;

export type SpecializationTable = DictTable<string>;
export type Specialization = Selectable<SpecializationTable>;
export type NewSpecialization = Insertable<SpecializationTable>;
export type UpdateSpecialization = Updateable<SpecializationTable>;

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

export interface PersonTable {
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

export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type UpdatePerson = Updateable<PersonTable>;
