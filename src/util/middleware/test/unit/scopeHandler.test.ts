import { APIGatewayProxyEvent } from 'aws-lambda';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { Database, ResourceTable } from '../../../db';
import { NotFoundError, UnauthorizedError } from '../../response';
import { ACCESS_SCOPES, ScopeController } from '../../scopeHandler';

jest.mock('../../../db', () => {
    return {
        getDatabase: jest.fn(),
    };
});

describe('ScopeController', () => {
    let mockQueryCreator: SelectQueryBuilder<Database, any, ResourceTable>;
    let db: Kysely<Database>;
    let scopeController: ScopeController;

    beforeEach(() => {
        mockQueryCreator = {
            select: jest.fn().mockReturnThis(),
            selectAll: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue([]),
            executeTakeFirst: jest.fn().mockResolvedValue([]),
        } as unknown as SelectQueryBuilder<Database, any, ResourceTable>;
        db = {
            selectFrom: jest.fn().mockReturnValue(mockQueryCreator),
        } as unknown as Kysely<Database>;
        scopeController = new ScopeController(db);
    });

    describe('verifyScopes', () => {
        it('should throw UnauthorizedError if user does not have required scopes', () => {
            const userScopes = [ACCESS_SCOPES.READ_OWN_PROFILE];
            const requiredScopes = [ACCESS_SCOPES.READ_ALL_PROFILE_DATA];
            expect(() =>
                ScopeController.verifyScopes(userScopes, requiredScopes)
            ).toThrowError(UnauthorizedError);
        });

        it('should not throw error if user has required scopes', () => {
            const userScopes = [ACCESS_SCOPES.READ_ALL_PROFILE_DATA];
            const requiredScopes = [ACCESS_SCOPES.READ_ALL_PROFILE_DATA];
            expect(() =>
                ScopeController.verifyScopes(userScopes, requiredScopes)
            ).not.toThrowError();
        });
    });

    describe('handler', () => {
        it('should throw NotFoundError if user is not found', async () => {
            const event = {
                user: { email: 'nonexistent@example.com' },
            } as unknown as APIGatewayProxyEvent;

            db.selectFrom = jest.fn().mockReturnValue(mockQueryCreator);
            mockQueryCreator.executeTakeFirst = jest
                .fn()
                .mockResolvedValue(undefined);

            await expect(scopeController.handler(event)).rejects.toThrow(
                NotFoundError
            );
        });

        it('should return user scopes if user is found', async () => {
            const event = {
                user: { email: 'user@example.com' },
            } as unknown as APIGatewayProxyEvent;
            db.selectFrom = jest.fn().mockReturnValue(mockQueryCreator);
            mockQueryCreator.executeTakeFirst = jest.fn().mockResolvedValue({
                email: 'user@example.com',
            });

            mockQueryCreator.execute = jest
                .fn()
                .mockResolvedValue([
                    { scope_label: ACCESS_SCOPES.READ_OWN_PROFILE },
                ]);

            const result = await scopeController.handler(event);
            expect(result.userScopes).toContain(ACCESS_SCOPES.READ_OWN_PROFILE);
        });
    });
});
