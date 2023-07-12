// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { formatResponse } from '../../util/util';
// import { Dict } from '../util/types/user';
// import { Client } from 'pg';
//
// const client = new Client(process.env.MAIN_DATABASE_URL);
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
//         await deleteUserRoles(event.pathParameters.id as string, roles);
//         return formatResponse(200, {
//             message: 'User roles deleted successfully',
//         });
//     } catch (error) {
//         return formatResponse(400, { message: (error as Error).message });
//     } finally {
//         client.end();
//     }
// };
//
// export const deleteUserRoles = async (
//     userId: string,
//     userRoles: { roleIds: number[] }
// ): Promise<void> => {
//     const roles: string[] = [];
//
//     const storedRoles = await client.query<Dict<string>[]>(
//         `SELECT id, name FROM role`
//     );
//
//     const baseRoles = storedRoles.filter(
//         (r) => r.name === 'Explorer' || r.name === 'Admin'
//     );
//
//     if (baseRoles.length > 0) {
//         throw new Error('Cannot delete base roles');
//     }
//
//     const allRoles = storedRoles.map((role: Dict<string>) => role.id);
//
//     for (const roleId of userRoles.roleIds) {
//         if (!allRoles.includes(roleId)) {
//             throw new Error('Role not found');
//         }
//
//         roles.push(`${roleId}`);
//     }
//
//     await client.query(
//         `DELETE FROM person_role WHERE user_id = ${userId} AND role_id IN (${roles.join(
//             ', '
//         )})`
//     );
// };
