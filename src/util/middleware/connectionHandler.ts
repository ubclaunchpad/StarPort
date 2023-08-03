import { IMiddleware } from './types';
import {Kysely} from "kysely";
import {Database} from "../db";

export class ConnectionHandler implements IMiddleware {
    connection: Kysely<Database>;

    constructor(connection) {
        this.connection = connection;
    }

    public handler = async () => {
       // TODO: Implement
    };
}
