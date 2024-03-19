import { LambdaBuilder } from '../util/middleware/middleware';
import { SuccessResponse } from '../util/middleware/response';
import { resourceSchema } from './mapper';

export const handler = new LambdaBuilder(getResourcesListRequest).build();

async function getResourcesListRequest() {
    return new SuccessResponse(getResourcesList());
}

export function getResourcesList() {
    return Object.keys(resourceSchema);
}
