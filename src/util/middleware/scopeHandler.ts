import { APIGatewayProxyEvent } from 'aws-lambda';
import { NotFoundError, UnauthorizedError } from './response';
import { IHandlerEvent, IMiddleware } from './types';
import {Kysely} from "kysely";
import {Database} from "../db";

export const ACCESS_SCOPES = {
    PROFILE_READ_OTHERS: 'profile:read:others',
    PROFILE_WRITE_OTHERS: 'profile:write:others',
    ADMIN_READ: 'admin:read',
    ADMIN_WRITE: 'admin:write',
}

export type AccessScope = typeof ACCESS_SCOPES[keyof typeof ACCESS_SCOPES];

export class ScopeController implements IMiddleware<IHandlerEvent, object> {
    private connection: Kysely<Database>;

    public static verifyScopes(scopes: AccessScope[], requiredScopes: AccessScope[]) {
        const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));
        console.log(missingScopes);

        if (missingScopes.length > 0) {
            throw new UnauthorizedError(`Missing scopes: ${missingScopes.join(', ')}`);
        }
    }


    public handler = async (event: APIGatewayProxyEvent) => {
        const userEmail = (event as unknown as { googleAccount: { email: string } })
            .googleAccount.email;
        const user = await this.connection.selectFrom('person').select(['email']).where('email','=', userEmail).executeTakeFirst();
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const scopes = await this.connection.selectFrom('scope_role')
            .innerJoin('role', 'scope_role.role_label', 'role.label')
            .innerJoin('person_role', 'role.id', 'person_role.role_id')
            .innerJoin('person', 'person_role.user_id', 'person.id')
            .select('scope_role.scope_label')
            .where('person.email', '=', userEmail)
            .execute();

        console.log(scopes);

        return {
            userScopes: scopes.map(scope => scope.scope_label)
        }
    };

    constructor( connection: Kysely<Database>) {
        this.connection = connection;
    }
}
