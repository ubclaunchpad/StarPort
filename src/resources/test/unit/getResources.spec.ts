import { Kysely, SelectQueryBuilder } from 'kysely';
import { Database, Resource as ResourceTable, getDatabase } from '../../../util/db';
import { getResources } from '../../getResources';
import { resourceSchema, Resource } from '../../mapper';

jest.mock('../../../util/db', () => {
    return {
        getDatabase: jest.fn(),
    };
});

describe('Get resources Unit Tests', () => {
    const resources = resourceSchema;
    const testResults = {
        faculty: [
            { id: 1, label: 'Faculty of Arts' },
            { id: 2, label: 'Faculty of Science' },
        ],
        specialization: [
            { id: 1, label: 'Computer Science' },
            { id: 2, label: 'Physics' },
        ],
        standing: [
            { id: 1, label: 'Freshman' },
            { id: 2, label: 'Sophomore' },
            { id: 3, label: 'Junior' },
            { id: 4, label: 'Senior' },
        ],
    };

    for (const [resourceName, resourceType] of Object.entries(resources)) {

        describe(`get ${resourceName}`, () => {
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

                (getDatabase as jest.Mock).mockReturnValue(mockDb);
            });

            it(`should return an array of ${resourceName}`, async () => {
                mockDb.selectFrom = jest.fn().mockReturnValue(mockQueryCreator);
                mockQueryCreator.execute = jest
                    .fn()
                    .mockResolvedValue(testResults[resourceType]);

                (getDatabase as jest.Mock).mockReturnValue(mockDb);

                const result = await getResources(resourceName as Resource, {
                    limit: 30,
                    offset: 0,
                });
                expect(result).toEqual(testResults[resourceType]);
            });

            it(`should return an empty array if there are no ${resourceName}`, async () => {
                const result = await getResources(resourceName as Resource, {
                    limit: 30,
                    offset: 0,
                });
                expect(result).toEqual([]);
            });
        });
    }
});
