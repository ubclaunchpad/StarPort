

export interface ProjectI {
    name: string;
    description: string;
    status_id: number;
}

export interface PaginationI {
    limit: number;
    offset: number;
  }
  

export interface ProjectQueryI extends Partial<PaginationI> {
    pid?: number;
    name?: string;
    sid?: number;
    userIds?: number[];
}