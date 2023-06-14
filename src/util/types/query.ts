export interface IQueryObjectResult<T> {
    [key: QueryObjectKey]: T;
}

type QueryObjectKey = string | number;