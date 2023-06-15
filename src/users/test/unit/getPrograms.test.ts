import { programQueryResult } from '../seed';
import { getProgramIdsAndNames } from '../../getPrograms';
import { mysql } from '../../../util/util';

jest.spyOn(mysql, 'query').mockImplementation(() =>
    Promise.resolve(programQueryResult)
);

describe('getPrograms', () => {
    it('should return a list of programs', async () => {
        const result = await getProgramIdsAndNames();
        expect(result).toEqual(programQueryResult[0].program);
    });
});
