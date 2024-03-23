import { Person } from '../db';

export interface IPagination {
    limit: number;
    offset: number;
    count?: number;
}

export interface IFilterItem {
    key: string;
    value: string | number;
    match: "exact" | "partial";
}

export type ORFilterQuery = IFilterItem[];

export type ANDFilters = ORFilterQuery[];

export interface IPersonQuery extends Partial<Person>, IPagination {
    search?: string;
    filter?: ANDFilters;
}

// Sample usage of the query structure
const sampleQuery: IPersonQuery = {
    limit: 10,
    offset: 0,
    search: "example",
    filter: [
        // Inside: OR where for each key/value in the array
        // Outside: AND -> just append wheres
        // can check for invalid keys or value mismatch
        // can use Zod or other validation libraries to check valid types
        [
            {
                key: "name",
                value: "y",
                match: "exact"
            },
            {
                key: "age",
                value: 12,
                match: "exact"
            }
        ],
        [
            {
                key: "name",
                value: "x",
                match: "exact"
            }
        ]
    ]
};
