import { getDatabase } from '../util/db';
import { Authorizer } from '../util/middleware/authorizer';
import { InputValidator } from '../util/middleware/inputValidator';
import { LambdaBuilder, LambdaInput } from '../util/middleware/middleware';
import {
    APIResponse,
    BadRequestError,
    SuccessResponse,
} from '../util/middleware/response';
import {
    ACCESS_SCOPES,
    ScopeController,
} from '../util/middleware/scopeHandler';

const db = getDatabase();
const validScopes = [
    ACCESS_SCOPES.ADMIN_DELETE,
    ACCESS_SCOPES.DELETE_ALL_PROFILE,
];

export const handler = new LambdaBuilder(router)
    .use(new InputValidator())
    .use(new Authorizer(db))
    .use(new ScopeController(db))
    .build();

export async function router(event: LambdaInput): Promise<APIResponse> {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    validateScope(event);

    const userID = event.pathParameters.id as string;
    await deleteUser(userID);
    await deleteUserRole(userID);

    return new SuccessResponse({
        message: `user with id : ${userID} deleted`,
    });
}

export const deleteUser = async (userId: string): Promise<void> => {
    const verifyRole = await db
        .selectFrom('person')
        .select(['id'])
        .where('id', '=', parseInt(userId))
        .executeTakeFirst();
    if (!verifyRole) {
        throw new BadRequestError(`user id: ${userId} does not exist`);
    }
    await db.deleteFrom('person').where('id', '=', Number(userId)).execute();
};

export const deleteUserRole = async (userId: string): Promise<void> => {
    await db
        .deleteFrom('person_role')
        .where('person_id', '=', Number(userId))
        .execute();
};

export const validateScope = (event: LambdaInput) => {
    if (!event.pathParameters) {
        throw new BadRequestError('Event path parameters missing');
    }
    if (!event.pathParameters.id) {
        throw new BadRequestError('Id missing');
    }

    const id = parseInt(event.pathParameters.id);
    const userScopes = event.userScopes;
    Authorizer.authorizeOrVerifyScopes(
        db,
        id,
        userScopes,
        ACCESS_SCOPES.DELETE_OWN_PROFILE,
        validScopes,
        event.user
    );
};
