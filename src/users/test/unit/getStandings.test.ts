import { standingQueryResult } from '../seed';
import { getStandingIdsAndNames } from '../../getStandings';
import { mysql } from '../../../util/util';

jest.spyOn(mysql, 'query').mockImplementation(() =>
    Promise.resolve(standingQueryResult)
);

describe('getStandings', () => {
    it('should return a list of standings', async () => {
        const result = await getStandingIdsAndNames();
        expect(result).toEqual(standingQueryResult[0].standing);
    });
});
