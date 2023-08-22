import { NewPersonRole, getDatabase } from '../util/db';
import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { InputValidator } from '../util/middleware/inputValidator';
import { APIGatewayEvent } from 'aws-lambda';
import axios from 'axios';

const db = getDatabase();
export const handler = new LambdaBuilder(updateRoleRequest)
    .use(new InputValidator())
    .build();

async function updateRoleRequest(event: APIGatewayEvent) {
    const params = new URLSearchParams(event.body || "");
    const query = params.get("text")?.split(" ") || [];
    const user_id = await getUserId(query[0], query[1], query[2]);
    if (user_id) {
        const roleType = params.get("channel_name")?.includes("tm-leads") ? "Lead" : "Member";
        const role_id = await getRoleId(roleType);
        await addPersonRole({ user_id, role_id });
        await axios.post(params.get("response_url") || "", {
            text: `Role of type ${roleType} has been added to your profile`,
            channel: params.get("user_id"),
        });
    } else {
        await axios.post(params.get("response_url") || "", {
            text: `User not found, please sign up at https://www.ubclaunchpad.com/auth/signin`,
            channel: params.get("user_id"),
        });
    }
    return new SuccessResponse({});
}

export const getUserId = async (firstName: string, lastName: string, email: string) => {
    const user = await db
                    .selectFrom('person')
                    .select('id')
                    .where('first_name', '=', firstName)
                    .where('last_name', '=', lastName)
                    .where('email', '=', email)
                    .executeTakeFirst();
    return user?.id;
};

export const getRoleId = async (roleType: string) => {
    const role = await db
                    .selectFrom('role')
                    .select('id')
                    .where('label', '=', roleType)
                    .executeTakeFirst();
    return role?.id;
};

export const addPersonRole = async (updateRole: NewPersonRole) => {
    const hasRole = await db
                        .selectFrom('person_role')
                        .select('user_id')
                        .where('user_id', '=', updateRole.user_id)
                        .executeTakeFirst();
    if (hasRole) {
        await db
            .deleteFrom('person_role')
            .where('user_id', '=', updateRole.user_id)
            .execute();
    }
    await db
        .insertInto('person_role')
        .values(updateRole)
        .execute();
};



