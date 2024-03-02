import { Person } from '../db';
import { Area } from '../wikidb';


export interface IPagination {
    limit: number;
    offset: number;
}

export type IPersonQuery = Partial<Person> & IPagination;
export type IAreaQuery = Partial<Area> & IPagination;

