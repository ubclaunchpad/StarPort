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
                MAIN_DATABASE_URL: process.env.MAIN_DATABASE_URL || '',
            },
        };

        const baseLambdaDir = 'dist/';
        const usersLambdaDir = `${baseLambdaDir}/users`;
        const rolesLambdaDir = `${baseLambdaDir}/roles`;
        const facultiesLambdaDir = `${baseLambdaDir}/faculties`;
        const standingsLambdaDir = `${baseLambdaDir}/standings`;
        const specializationsLambdaDir = `${baseLambdaDir}/specializations`;
        const slackLambdaDir = `${baseLambdaDir}/slack`;

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
                                        }
                                    },
                                    subresources: {
                                        "{roleId}": {
                                            endpoints: {
                                                POST: {
                                                    id: 'addUserRole',
                                                    path: `${baseLambdaDir}/roles/addUserRole`,
                                                },
                                                DELETE: {
                                                    id: 'deleteUserRole',
                                                    path: `${baseLambdaDir}/roles/deleteUserRole`,
                                                },
                                            }
                                        }
                                    }
                                },
                            },
                        },

                        me: {
                            endpoints: {
                                GET: {
                                    id: 'getUserId',
                                    path: `${usersLambdaDir}/getUserId`,
                                },
                            },
                        },
                    },
                },
                faculties: {
                    endpoints: {
                        GET: {
                            id: 'getFaculties',
                            path: `${facultiesLambdaDir}/getFaculties`,
                        },
                        POST: {
                            id: 'createFaculty',
                            path: `${facultiesLambdaDir}/createFaculty`,
                        },
                        PATCH: {
                            id: 'updateFaculty',
                            path: `${facultiesLambdaDir}/updateFaculty`,
                        },
                        DELETE: {
                            id: 'deleteFaculty',
                            path: `${facultiesLambdaDir}/deleteFaculty`,
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
                        "{id}": {
                            endpoints: {
                                PATCH: {
                                    id: 'updateRole',
                                    path: `${rolesLambdaDir}/updateRole`,
                                },
                                DELETE: {
                                    id: 'deleteRole',
                                    path: `${rolesLambdaDir}/deleteRole`,
                                },
                            }

                        }
                    }
                },
                specializations: {
                    endpoints: {
                        GET: {
                            id: 'getSpecializations',
                            path: `${specializationsLambdaDir}/getSpecializations`,
                        },
                        POST: {
                            id: 'createSpecialization',
                            path: `${specializationsLambdaDir}/createSpecialization`,
                        },
                        PATCH: {
                            id: 'updateSpecialization',
                            path: `${specializationsLambdaDir}/updateSpecialization`,
                        },
                        DELETE: {
                            id: 'deleteSpecialization',
                            path: `${specializationsLambdaDir}/deleteSpecialization`,
                        },
                    },
                },
                standings: {
                    endpoints: {
                        GET: {
                            id: 'getStandings',
                            path: `${standingsLambdaDir}/getStandings`,
                        },
                        POST: {
                            id: 'createStanding',
                            path: `${standingsLambdaDir}/createStanding`,
                        },
                        PATCH: {
                            id: 'updateStanding',
                            path: `${standingsLambdaDir}/updateStanding`,
                        },
                        DELETE: {
                            id: 'deleteStanding',
                            path: `${standingsLambdaDir}/deleteStanding`,
                        },
                    },
                },
                slack: {
                    endpoints: {
                        POST: {
                            id: 'updateRoleForMember',
                            path: `${slackLambdaDir}/addMemberRole`,
                        },
                    }
                }
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
