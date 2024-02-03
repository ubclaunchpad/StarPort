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
    WRITE_PROFILE: 'write:profile',
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
        scopes: AccessScope[],
        requiredScopes: AccessScope[]
    ) {
        const missingScopes = requiredScopes.filter(
            (scope) => !scopes.includes(scope)
        );
        console.log(missingScopes);

        if (missingScopes.length > 0) {
            throw new UnauthorizedError(
                `Missing scopes: ${missingScopes.join(', ')}`
            );
        }
    }

    public handler = async (event: APIGatewayProxyEvent) => {
        const userEmail = (
            event as unknown as { googleAccount: { email: string } }
        ).googleAccount.email;
        const user = await this.connection
            .selectFrom('person')
            .select(['email'])
            .where('email', '=', userEmail)
            .executeTakeFirst();
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const scopes = await this.connection
            .selectFrom('scope_role')
            .innerJoin('role', 'role.label', 'scope_role.role_label')
            .innerJoin('person', 'person.person_role_id', 'role.id')
            .innerJoin('person', 'person_role.user_id', 'person.id')
            .select('scope_role.scope_label')
            .where('person.email', '=', userEmail)
            .execute();

        console.log(scopes);

        return {
            userScopes: scopes.map((scope) => scope.scope_label),
        };
    };

    constructor(connection: Kysely<Database>) {
        this.connection = connection;
    }
}
