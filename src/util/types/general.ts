import { Person } from '../db';

export interface IPagination {
    limit: number;
    offset: number;
    count?: number;
}

export interface IPersonQuery extends Partial<Person>, IPagination{
    search?: string;
    filter?: {
        first_name?: string;
        person_role_id?: number;
        status?: string;
        project_team?: string;
        // Add more filter options as needed
    };
}
