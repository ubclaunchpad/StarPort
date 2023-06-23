import { IPagination } from './general';

export interface IUserBasicInfo {
    firstName: string;
    prefName: string;
    lastName: string;
    email: string;
    standingId: number;
    facultyId: number;
    specializationId: number;
}

export interface IIntegrations {
    GithubCode?: string;
}

// keys of IUserBasicInfo

export interface IUserPersonal {
    ethnicityId?: number[];
    genderId?: number[];
    resumeLink?: string;
    integrations: IIntegrations;
}

export interface IUserQuery extends Partial<IPagination> {
    fid?: number;
    fn?: string;
    pn?: string;
    ln?: string;
    email?: string;
    pid?: number;
    g?: number;
    sid?: number;
}

export interface UserI extends IUserBasicInfo, IUserPersonal {}
export type UserUpdateI = Partial<UserI>;

export interface IUserQueryResult {
    firstName: string;
    prefName: string;
    lastName: string;
    email: string;
    standingId: number;
    facultyId: number;
    facultyName: string;
    specializationId: number;
    specializationName: number;
}

export interface IUserInfo {
    id: number;
    firstName: string;
    lastName: string;
    prefName: string;
    resumeLink?: string;
    email: string;
    faculty: Dict<string>;
    standing: Dict<string>;
    specialization: Dict<string>;
    roles: Dict<string>[];
    username: string;
    createdAt: string;
    updatedAt: string;
    memberSince: string | undefined;
}

export interface Dict<T> {
    id: number;
    name: T;
}

export type IFaculty = Dict<string>[];
export type ISpecialization = Dict<string>[];
export type IStanding = Dict<string>[];
export type IRole = Dict<string>[];
