import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { IDatabaseConfig } from '../config/database.config';
import { ApiService, IApiResources } from './templates/apigateway';
config();

export const Database_STACK_INFO: StackInfo = { NAME: 'database-stack' };
export interface DatabaseStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class DatabaseStack extends LPStack {
    public STACK_INFO: StackInfo = Database_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);
        const { databaseConfig } = props;

        const dataBaseInfo = {
            DB_HOST: databaseConfig.host,
            DB_USERNAME: databaseConfig.user,
            DB_PASSWORD: databaseConfig.password,
            DB_NAME: databaseConfig.database,
        };

        const lambdaConfigs = {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
                MAIN_DATABASE_URL: process.env.MAIN_DATABASE_URL || '',
            },
        };

        const baseLambdaDir = 'dist/';
        const databaseLambdaDir = `${baseLambdaDir}/database`;

        const apiResources: IApiResources = {
            subresources: {
                query: {
                    endpoints: {
                        POST: {
                            id: 'queryDatabase',
                            path: `${databaseLambdaDir}/queryDatabase`,
                        },
                    },
                },
            },
        };

        this.apiService = new ApiService(
            this,
            apiResources,
            `${Database_STACK_INFO.NAME}-API`,
            lambdaConfigs
        );
    }
}
