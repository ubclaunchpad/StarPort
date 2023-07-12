// import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { formatResponse } from '../util/util';
// import { getDatabase, NewRole, UpdateRole } from '../util/db';
//
// let roles;
//
// const db = getDatabase();
// export const handler = async function (
//     event: APIGatewayEvent
// ): Promise<APIGatewayProxyResult> {
//     try {
//         switch (event.httpMethod) {
//             case 'GET':
//                 return formatResponse(200, await getRoles());
//             case 'POST': {
//                 const { label } = JSON.parse(event.body);
//                 await createRole({ label });
//                 await refreshCache();
//                 return formatResponse(200, { message: 'Success' });
//             }
//             case 'PATCH': {
//                 const { id, label } = JSON.parse(event.body);
//                 await updateRole({ id, label });
//                 await refreshCache();
//                 return formatResponse(200, { message: 'Success' });
//             }
//             case 'DELETE': {
//                 const { id } = JSON.parse(event.body);
//                 await deleteRole(id);
//                 await refreshCache();
//                 return formatResponse(200, { message: 'Success' });
//             }
//             default:
//                 return formatResponse(400, { message: 'Bad Request' });
//         }
//     } catch (error) {
//         return formatResponse(400, { message: (error as Error).message });
//     }
// };
//
// export const refreshCache = async () => {
//     roles = (await db.selectFrom('role').selectAll().execute()) as {
//         id: string;
//         label: string;
//     }[];
// };
//
// export const getRoles = async () => {
//     if (!roles) {
//         await refreshCache();
//     }
//     return roles;
// };
//
// export const createRole = async (newRole: NewRole) => {
//     const { id } = await db
//         .insertInto('role')
//         .values(newRole)
//         .returning('id')
//         .executeTakeFirst();
//     return id;
// };
//
// export const updateRole = async (updateRole: UpdateRole) => {
//     await db
//         .updateTable('standing')
//         .set(updateRole)
//         .where('id', '=', updateRole.id)
//         .execute();
// };
//
// export const deleteRole = async (id: string) => {
//     await db.deleteFrom('role').where('id', '=', id).execute();
// };
