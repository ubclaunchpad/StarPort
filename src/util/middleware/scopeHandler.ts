import { APIGatewayProxyEvent } from 'aws-lambda';
import { Kysely } from 'kysely';
import { Database } from '../db';
import { NotFoundError, UnauthorizedError } from './response';
import { IHandlerEvent, IMiddleware } from './types';

export const ACCESS_SCOPES = {
    ADMIN_READ: 'read:admin',
    READ_ALL_PROFILE_DATA: 'read:profile:all',
    READ_OWN_PROFILE: 'read:profile:personal',
    READ_RESTRICTED_PROFILE_DATA: 'read:profile:restricted',
    ADMIN_WRITE: 'write:admin',
    WRITE_PROFILE: 'write:profile:all',
    ADMIN_UPDATE: 'update:admin',
    UPDATE_ALL_PROFILE: 'update:profile:all',
    UPDATE_OWN_PROFILE: 'update:profile:personal',
    ADMIN_DELETE: 'delete:admin',
    DELETE_ALL_PROFILE: 'delete:profile:all',
    DELETE_OWN_PROFILE: 'delete:profile:personal',
};

export type AccessScope = (typeof ACCESS_SCOPES)[keyof typeof ACCESS_SCOPES];

export class ScopeController implements IMiddleware<IHandlerEvent, object> {
    private connection: Kysely<Database>;

    public static verifyScopes(
        userScopes: AccessScope[],
        requiredScopes: AccessScope[]
    ) {
        const hasRequiredScope = requiredScopes.some((scope) =>
            userScopes.includes(scope)
        );

        if (!hasRequiredScope) {
            throw new UnauthorizedError(`Missing required permission.`);
        }
    }

    public handler = async (event: APIGatewayProxyEvent) => {
        const userEmail = (event as unknown as { user: { email: string } }).user
            .email;
        const user = await this.connection
            .selectFrom('person')
            .select(['email'])
            .where('email', '=', userEmail)
            .executeTakeFirst();
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const scopes = await this.connection
            .selectFrom('user_scopes_view')
            .select('scope_label')
            .where('email', '=', userEmail)
            .execute();

        return {
            userScopes: scopes.map((scope) => scope.scope_label),
        };
    };

    constructor(connection: Kysely<Database>) {
        this.connection = connection;
    }
}
