import { socialQueryResult } from '../seed';
import { getSocialIdsAndNames } from '../../getSocials';
import { mysql } from '../../../util/util';

jest.spyOn(mysql, 'query').mockImplementation(() =>
    Promise.resolve(socialQueryResult)
);

describe('getSocials', () => {
    it('should return a list of social platforms', async () => {
        const result = await getSocialIdsAndNames();
        expect(result).toEqual(socialQueryResult[0].socials);
    });
});
