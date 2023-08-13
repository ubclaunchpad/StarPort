import {
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    DummyDriver,
    PostgresQueryCompiler,
    Generated,
    Insertable,
    Selectable,
    Updateable,
    CompiledQuery,
} from 'kysely';
import { config } from 'dotenv';
import axios from 'axios';
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
    project: ProjectTable;
    project_status: ProjectStatusTable;
    resource_type: ResourceTypeTable;
    project_resource: ProjectResourceTable;
    project_role: ProjectRoleTable;
    project_person: ProjectPersonTable;
}

export function getDatabaseParser() {
    const db: Kysely<Database> = new Kysely({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });
    return db;
}

export async function queryDatabaseAPI(
    compiledQuery: CompiledQuery
): Promise<{ rows: any[]; insertId?: string; affectedRows?: any }> {
    const res = await axios.post(
        'https://k9nkppl732.execute-api.us-west-2.amazonaws.com/prod/query',
        {
            ...compiledQuery,
        }
    );

    console.log(res.data);
    return res.data;
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

export interface ProjectTable {
    title: string;
    description: string;
    start_date: Date;
    end_date: Date;
    status: string;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;
export type UpdateProject = Updateable<ProjectTable>;

export interface ProjectStatusTable {
    label: string;
    description: string;
}

export type ProjectStatus = Selectable<ProjectStatusTable>;
export type NewProjectStatus = Insertable<ProjectStatusTable>;
export type UpdateProjectStatus = Updateable<ProjectStatusTable>;

export interface ResourceTypeTable {
    label: string;
    description: string;
    link: string;
}

export type ResourceType = Selectable<ResourceTypeTable>;
export type NewResourceType = Insertable<ResourceTypeTable>;
export type UpdateResourceType = Updateable<ResourceTypeTable>;

export interface ProjectResourceTable {
    project_title: string;
    resource_type: string;
}

export type ProjectResource = Selectable<ProjectResourceTable>;
export type NewProjectResource = Insertable<ProjectResourceTable>;
export type UpdateProjectResource = Updateable<ProjectResourceTable>;

export interface ProjectRoleTable {
    label: string;
    description?: string;
}

export type ProjectRole = Selectable<ProjectRoleTable>;
export type NewProjectRole = Insertable<ProjectRoleTable>;
export type UpdateProjectRole = Updateable<ProjectRoleTable>;

export interface ProjectPersonTable {
    project_title: string;
    person_id: string;
    role: string;
}

export type ProjectPerson = Selectable<ProjectPersonTable>;
export type NewProjectPerson = Insertable<ProjectPersonTable>;
export type UpdateProjectPerson = Updateable<ProjectPersonTable>;
