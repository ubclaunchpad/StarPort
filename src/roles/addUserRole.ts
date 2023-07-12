// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { formatResponse } from '../../util/util';
// import { verifyUserIsLoggedIn } from '../util/authorization';
// import { Client } from 'pg';
//
// const client = new Client(process.env.MAIN_DATABASE_URL);
// console.log(process.env.MAIN_DATABASE_URL);
// (async () => {
//     await client.connect();
// })();
//
// export const handler = async function (
//     event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> {
//     try {
//         if (event === null) {
//             throw new Error('event not found');
//         }
//         const auth = event.headers.Authorization;
//
//         if (auth === undefined) {
//             throw new Error('Authorization header is missing');
//         }
//
//         await verifyUserIsLoggedIn(auth);
//
//         if (event.body === null) {
//             throw new Error('Request body is missing');
//         }
//
//         const roles = JSON.parse(event.body) as { roleIds: number[] };
//
//         if (roles.roleIds === null || roles.roleIds.length === 0) {
//             throw new Error('Role ids are missing');
//         }
//
//         if (event.pathParameters === null || event.pathParameters.id === null) {
//             throw new Error('User id is missing');
//         }
//
//         await addUserRoles(event.pathParameters.id as string, roles);
//         return formatResponse(200, {
//             message: 'User roles added successfully',
//         });
//     } catch (error) {
//         return formatResponse(400, { message: (error as Error).message });
//     } finally {
//         client.end();
//     }
// };
//
// export const addUserRoles = async (
//     userId: string,
//     userRoles: { roleIds: number[] }
// ): Promise<void> => {
//     const roles: string[] = [];
//
//     for (const roleId of userRoles.roleIds) {
//         roles.push(`(${userId}, ${roleId})`);
//     }
//
//     await client.query(
//         `INSERT INTO person_role (user_id, role_id) VALUES ${roles.join(
//             ', '
//         )} ON DUPLICATE KEY UPDATE role_id=role_id`
//     );
// };
