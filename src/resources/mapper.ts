import { ForbiddenError } from '../util/middleware/response';

export type Resource = 'faculty' | 'specialization' | 'standing';

export const resourceSchema: { [key: string]: Resource } = {
    faculties: 'faculty',
    specializations: 'specialization',
    standings: 'standing',
} as const;

export const mapResource = (resourceType: string) => {
    if (resourceSchema[resourceType as Resource]) {
        return resourceSchema[resourceType as Resource];
    } else {
        throw new ForbiddenError('Resource not found');
    }
};
