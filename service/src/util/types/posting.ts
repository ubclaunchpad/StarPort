import { IPagination } from './general';

export interface IProject {
    name: string;
    description: string;
    status_id: number;
}

export interface IProjectQuery extends Partial<IPagination> {
    pid?: number;
    name?: string;
    sid?: number;
    userIds?: number[];
}
