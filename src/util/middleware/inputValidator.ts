import { IMiddleware, ISchemaValidator } from './types';

export class InputValidator implements IMiddleware, ISchemaValidator {
    public handler = async () => {
        await this.validate();
    };

    validate(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
