import { facultyQueryResult } from "../seed";
import { getFacultyIdsAndNames } from "../../getFaculties";
import { mysql } from "../../../util/util";

jest.spyOn(mysql, 'query').mockImplementation(() => Promise.resolve(facultyQueryResult));


describe('getFaculties', () => {
    it('should return a list of faculties', async () => {
        const result = await getFacultyIdsAndNames();
        expect(result).toEqual(facultyQueryResult[0].faculty);
    });
    test.todo('should return an empty object if no faculties are found');
});