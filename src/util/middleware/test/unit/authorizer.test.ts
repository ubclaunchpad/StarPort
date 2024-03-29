import { APIGatewayProxyEvent } from 'aws-lambda';
import { Kysely, SelectQueryBuilder } from 'kysely';
import { GoogleAuthUser } from '../../../authorization';
import { Database, ResourceTable } from '../../../db';
import { Authorizer } from '../../authorizer';
import { NotFoundError, UnauthorizedError } from '../../response';
import mockJwtDecode from '../__mocks__/jwt-decode';

jest.mock('jwt-decode', () => jest.fn());
jest.mock('../../../db', () => {
    return {
        getDatabase: jest.fn(),
    };
});

describe('Authorizer', () => {
    let authorizer: Authorizer;
    let mockDb: Kysely<Database>;
    let mockQueryCreator: SelectQueryBuilder<Database, any, ResourceTable>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockQueryCreator = {
            select: jest.fn().mockReturnThis(),
            selectAll: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue([]),
        } as unknown as SelectQueryBuilder<Database, any, ResourceTable>;
        mockDb = {
            selectFrom: jest.fn().mockReturnValue(mockQueryCreator),
        } as unknown as Kysely<Database>;
        authorizer = new Authorizer(mockDb);
    });

    describe('verifyUserIsLoggedIn', () => {
        it('should throw UnauthorizedError if Authorization header is missing', async () => {
            const event = { headers: {} } as APIGatewayProxyEvent;
            await expect(authorizer.handler(event)).rejects.toThrowError(
                UnauthorizedError
            );
        });

        it('should throw NotFoundError if email is missing in decoded JWT', async () => {
            const event = { headers: { Authorization: 'mock_token' } } as any;
            mockJwtDecode.mockReturnValueOnce({});
            await expect(authorizer.handler(event)).rejects.toThrowError(
                NotFoundError
            );
        });

        it('should throw NotFoundError if user is not found in database', async () => {
            const event = { headers: { Authorization: 'mock_token' } } as any;
            mockJwtDecode.mockReturnValueOnce({ email: 'test@example.com' });
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest.fn().mockResolvedValueOnce(null),
            });
            await expect(authorizer.handler(event)).rejects.toThrowError(
                NotFoundError
            );
        });

        it('should return user object if user is found in database', async () => {
            const event = { headers: { Authorization: 'mock_token' } } as any;
            const mockUser = { id: 1, email: 'test@example.com' };
            mockJwtDecode.mockReturnValueOnce({ email: 'test@example.com' });
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest.fn().mockResolvedValueOnce(mockUser),
            });
            const result = await authorizer.handler(event);
            expect(result).toEqual({ user: mockUser });
        });
    });
    describe('verifyCurrentUser', () => {
        let mockGoogleAuthUser: GoogleAuthUser;
        beforeEach(() => {
            mockGoogleAuthUser = {
                aud: 'mock-aud',
                azp: 'mock-azp',
                email: 'test@example.com',
                email_verified: true,
                exp: 1234567890,
                family_name: 'Doe',
                given_name: 'John',
                iat: 1234567890,
                iss: 'mock-iss',
                jti: 'mock-jti',
                name: 'John Doe',
                nbf: 1234567890,
                picture: 'https://example.com/profile.jpg',
                sub: 'mock-sub',
                token: 'mock-token',
            };
            mockJwtDecode.mockReturnValue(mockGoogleAuthUser);
        });

        it('should return false if user is not found in database', async () => {
            const userId = 1;
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest.fn().mockResolvedValueOnce(null),
            });
            const result = await Authorizer.verifyCurrentUser(
                mockDb,
                userId,
                mockGoogleAuthUser
            );
            expect(result).toBe(false);
        });

        it('should return true if user is found in database and email matches', async () => {
            const userId = 1;
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest
                    .fn()
                    .mockResolvedValueOnce({ email: 'test@example.com' }),
            });
            const result = await Authorizer.verifyCurrentUser(
                mockDb,
                userId,
                mockGoogleAuthUser
            );
            expect(result).toBe(true);
        });
    });

    describe('authorizeOrVerifyScopes', () => {
        let mockGoogleAuthUser: GoogleAuthUser;
        beforeEach(() => {
            mockGoogleAuthUser = {
                aud: 'mock-aud',
                azp: 'mock-azp',
                email: 'test@example.com',
                email_verified: true,
                exp: 1234567890,
                family_name: 'Doe',
                given_name: 'John',
                iat: 1234567890,
                iss: 'mock-iss',
                jti: 'mock-jti',
                name: 'John Doe',
                nbf: 1234567890,
                picture: 'https://example.com/profile.jpg',
                sub: 'mock-sub',
                token: 'mock-token',
            };
            mockJwtDecode.mockReturnValue(mockGoogleAuthUser);
        });

        it('should return if user has personal scope and is current user', async () => {
            const userId = 1;
            const userScopes = ['read:admin', 'read:profile:personal'];
            const personalScope = 'read:profile:personal';
            const validScopes = ['read:admin'];
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest
                    .fn()
                    .mockResolvedValueOnce({ email: 'test@example.com' }),
            });
            await expect(
                Authorizer.authorizeOrVerifyScopes(
                    mockDb,
                    userId,
                    userScopes,
                    personalScope,
                    validScopes,
                    mockGoogleAuthUser
                )
            ).resolves.not.toThrow();
        });

        it('should throw error if user does not have valid scopes', async () => {
            const userId = 1;
            const userScopes = ['read:profile:personal'];
            const personalScope = 'read:profile:personal';
            const validScopes = ['read:admin'];
            mockDb.selectFrom = jest.fn().mockReturnValueOnce({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                executeTakeFirst: jest
                    .fn()
                    .mockResolvedValueOnce({ email: 'other@example.com' }),
            });
            await expect(
                Authorizer.authorizeOrVerifyScopes(
                    mockDb,
                    userId,
                    userScopes,
                    personalScope,
                    validScopes,
                    mockGoogleAuthUser
                )
            ).rejects.toThrowError('Missing required permission.');
        });
    });
});
