

export interface PaginationI {
    limit: number;
    offset: number;
  }
  

export interface PostingQueryI extends Partial<PaginationI> {
    pid?: number;
    projectId?: number;
}

export interface ApplicationsQueryI extends Partial<PaginationI> {
    pid?: number;
    isMember?: boolean;
    applicantEmail?: string;
}