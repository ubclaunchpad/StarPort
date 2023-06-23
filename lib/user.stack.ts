import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { IDatabaseConfig } from '../config/database.config';
import { ApiService, IApiResources } from './templates/apigateway';
config();

export const USER_STACK_INFO: StackInfo = { NAME: 'users-stack' };
export interface UserStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class UserStack extends LPStack {
    public STACK_INFO: StackInfo = USER_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: UserStackProps) {
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
            },
        };

        const baseLambdaDir = 'dist/users';

        const apiResources: IApiResources = {
            subresources: {
                users: {
                    endpoints: {
                        GET: {
                            id: 'getUsers',
                            path: `${baseLambdaDir}/getUsers`,
                        },
                        POST: {
                            id: 'createUser',
                            path: `${baseLambdaDir}/createUser`,
                        },
                    },

                    subresources: {
                        '{id}': {
                            endpoints: {
                                GET: {
                                    id: 'getUser',
                                    path: `${baseLambdaDir}/getUser`,
                                },
                                PATCH: {
                                    id: 'editUser',
                                    path: `${baseLambdaDir}/editUser`,
                                },
                                DELETE: {
                                    id: 'deleteUser',
                                    path: `${baseLambdaDir}/deleteUser`,
                                },
                            },
                        },

                        me: {
                            endpoints: {
                                GET: {
                                    id: 'getUserId',
                                    path: `${baseLambdaDir}/getUserId`,
                                },
                            },
                        },
                    },
                },
                faculties: {
                    endpoints: {
                        GET: {
                            id: 'getFaculties',
                            path: `${baseLambdaDir}/getFaculties`,
                        },
                    },
                },
                roles: {
                    endpoints: {
                        GET: {
                            id: 'getRoles',
                            path: `${baseLambdaDir}/getRoles`,
                        },
                    },
                },
                specializations: {
                    endpoints: {
                        GET: {
                            id: 'getSpecializations',
                            path: `${baseLambdaDir}/getSpecializations`,
                        },
                    },
                },
                standings: {
                    endpoints: {
                        GET: {
                            id: 'getStandings',
                            path: `${baseLambdaDir}/getStandings`,
                        },
                    },
                },
            },
        };

        this.apiService = new ApiService(
            this,
            apiResources,
            `${USER_STACK_INFO.NAME}-API`,
            lambdaConfigs
        );
    }
}
