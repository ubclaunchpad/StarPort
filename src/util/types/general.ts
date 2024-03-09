import { Person } from '../db';

export interface IPagination {
    limit: number;
    offset: number;
}

export type IPersonQuery = Partial<Person> & IPagination;



export type Link = {
    label: string;
    href: string;
    domain: string;
};