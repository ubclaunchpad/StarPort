import { IPagination } from './general';

export interface IUserBasicInfo {
    firstName: string;
    prefName: string;
    lastName: string;
    email: string;
    standingId: number;
    facultyId: number;
    programId: number;
}

export interface IIntegrations {
    GithubCode?: string;
}

// keys of IUserBasicInfo

export interface UserInfo {
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

export interface UserI extends IUserBasicInfo, UserInfo {}
export type UserUpdateI = Partial<UserI>;
