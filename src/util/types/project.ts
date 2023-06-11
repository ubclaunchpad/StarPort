import { IPagination } from './general';

export interface IPostingQuery extends Partial<IPagination> {
    pid?: number;
    projectId?: number;
}

export interface IApplicationQuery extends Partial<IPagination> {
    pid?: number;
    isMember?: boolean;
    applicantEmail?: string;
}
