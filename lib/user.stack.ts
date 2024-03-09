import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo, StackProps } from './util/LPStack';
import { IDatabaseConfig } from '../config/database.config';
import { ApiService, IApiResources } from './templates/apigateway';
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
        const facultiesLambdaDir = `${baseLambdaDir}/faculties`;
        const standingsLambdaDir = `${baseLambdaDir}/standings`;
        const specializationsLambdaDir = `${baseLambdaDir}/specializations`;

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
                    },
                    subresources: {
                        "{id}": {
                            endpoints: {
                                DELETE: {
                                    id: 'deleteFaculty',
                                    path: `${facultiesLambdaDir}/deleteFaculty`,
                                },
                                PATCH: {
                                    id: 'updateFaculty',
                                    path: `${facultiesLambdaDir}/updateFaculty`,
                                },
                            }
                        }
                    }
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
                       
                    },
                    subresources: {
                        "{id}": {
                            endpoints: {
                                DELETE: {
                                    id: 'deleteSpecialization',
                                    path: `${specializationsLambdaDir}/deleteSpecialization`,
                                },
                                PATCH: {
                                    id: 'updateSpecialization',
                                    path: `${specializationsLambdaDir}/updateSpecialization`,
                                },
                            }
                        }
                    }
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
                        
                    },
                    subresources: {
                        "{id}": {
                            endpoints: {
                                DELETE: {
                                    id: 'deleteStanding',
                                    path: `${standingsLambdaDir}/deleteStanding`,
                                },
                                PATCH: {
                                    id: 'updateStanding',
                                    path: `${standingsLambdaDir}/updateStanding`,
                                },
                            }
                        }
                    }
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
