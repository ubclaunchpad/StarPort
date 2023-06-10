export interface UserBasicI
{
  firstName: string;
  prefName: string;
  lastName: string;
  email: string;
  standingId: number;
  facultyId: number;
  programId: number;
}

export interface UserInfo {
 
  ethnicityId?: number[];
  genderId?: number[];
  resumeLink?: string;
}

export interface PaginationI {
  limit: number;
  offset: number;
}

export interface UserQueryI extends Partial<PaginationI>{
    fid?: number;
    fn?: string;
    pn?: string
    ln?: string;
    email?: string;
    pid?: number;
    g?: number;
    sid?: number;
  }

export interface UserI extends UserBasicI, UserInfo {};
export type UserUpdateI = Partial<UserI>;
