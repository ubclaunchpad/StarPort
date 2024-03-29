import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { config } from 'dotenv';
import { IDatabaseConfig } from '../config/database.config';
import { ApiService, IApiResources } from './templates/apigateway';
import { LPStack, StackInfo, StackProps } from './util/LPStack';
config();

export const USER_STACK_INFO: StackInfo = { NAME: 'users-stack' };
export interface UserStackProps extends StackProps {
    databaseConfig: IDatabaseConfig;
}

export class UserStack extends LPStack {
    public STACK_INFO: StackInfo = USER_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: UserStackProps) {
        super(scope, id, props);
        const { databaseConfig } = props;

        const lambdaConfigs = {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            environment: {
                ...databaseConfig,
                mode: props.mode,
                MAIN_DATABASE_URL: process.env.MAIN_DATABASE_URL || '',
            },
        };

        const baseLambdaDir = 'dist/';
        const usersLambdaDir = `${baseLambdaDir}/users`;
        const rolesLambdaDir = `${baseLambdaDir}/roles`;
        const resourcesLambdaDir = `${baseLambdaDir}/resources`;

        const apiResources: IApiResources = {
            subresources: {
                users: {
                    endpoints: {
                        GET: {
                            id: 'getUsers',
                            path: `${usersLambdaDir}/getUsers`,
                        },
                        POST: {
                            id: 'createUser',
                            path: `${usersLambdaDir}/createUser`,
                        },
                    },
                    subresources: {
                        query: {
                            endpoints: {
                                POST: {
                                    id: 'queryUsers',
                                    path: `${usersLambdaDir}/queryUsers`,
                                },
                            },
                        },
                        me: {
                            endpoints: {
                                GET: {
                                    id: 'getMe',
                                    path: `${usersLambdaDir}/getMe`,
                                },
                            },
                        },
                        '{id}': {
                            endpoints: {
                                GET: {
                                    id: 'getUser',
                                    path: `${usersLambdaDir}/getUser`,
                                },
                                PATCH: {
                                    id: 'editUser',
                                    path: `${usersLambdaDir}/editUser`,
                                },
                                DELETE: {
                                    id: 'deleteUser',
                                    path: `${usersLambdaDir}/deleteUser`,
                                },
                            },
                            subresources: {
                                roles: {
                                    endpoints: {
                                        GET: {
                                            id: 'getUserRoles',
                                            path: `${baseLambdaDir}/roles/getUserRoles`,
                                        },
                                    },
                                    subresources: {
                                        '{roleId}': {
                                            endpoints: {
                                                POST: {
                                                    id: 'addUserRole',
                                                    path: `${baseLambdaDir}/roles/addUserRole`,
                                                },
                                                DELETE: {
                                                    id: 'deleteUserRole',
                                                    path: `${baseLambdaDir}/roles/deleteUserRole`,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                resources: {
                    endpoints: {
                        GET: {
                            id: 'resourcesList',
                            path: `${resourcesLambdaDir}/resourcesList`,
                        },
                    },
                    subresources: {
                        '{rname}': {
                            endpoints: {
                                GET: {
                                    id: 'getResources',
                                    path: `${resourcesLambdaDir}/getResources`,
                                },
                                POST: {
                                    id: 'createResource',
                                    path: `${resourcesLambdaDir}/createResource`,
                                },
                            },
                            subresources: {
                                '{id}': {
                                    endpoints: {
                                        DELETE: {
                                            id: 'deleteResource',
                                            path: `${resourcesLambdaDir}/deleteResource`,
                                        },
                                        PATCH: {
                                            id: 'updateResource',
                                            path: `${resourcesLambdaDir}/updateResource`,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                roles: {
                    endpoints: {
                        GET: {
                            id: 'getRoles',
                            path: `${rolesLambdaDir}/getRoles`,
                        },
                        POST: {
                            id: 'createRole',
                            path: `${rolesLambdaDir}/createRole`,
                        },
                    },
                    subresources: {
                        '{id}': {
                            endpoints: {
                                PATCH: {
                                    id: 'updateRole',
                                    path: `${rolesLambdaDir}/updateRole`,
                                },
                                DELETE: {
                                    id: 'deleteRole',
                                    path: `${rolesLambdaDir}/deleteRole`,
                                },
                            },
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
