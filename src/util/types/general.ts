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

// Sample usage of the query structure (used with queryUsers POST endpoint in request body)
// Inside: OR where for each key/value in the array
// Outside: AND -> just append wheres
// {
//     "filter": [
//         [
//             {
//                 "key": "first_name",
//                 "value": "john",
//                 "match": "exact"
//             },
//             {
//                 "key": "person_role_id",
//                 "value": "1",
//                 "match": "exact"
//             }
//         ],
//         [
//             {
//                 "key": "first_name",
//                 "value": "joh",
//                 "match": "partial"
//             }
//         ]
//     ]
// }

export type Link = {
    label: string;
    href: string;
    domain: string;
};
