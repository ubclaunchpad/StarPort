import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { IDatabaseConfig } from '../config/database.config';
import { StackInfo } from './util/LPStack';
import { ApiService, IApiResources } from './templates/apigateway';
config({ path: `.env.local`, override: true });

export const Team_STACK_INFO: StackInfo = { NAME: 'team-stack' };

export interface TeamStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class TeamStack extends cdk.Stack {
    apiService: ApiService;
    public STACK_INFO: StackInfo = Team_STACK_INFO;

    constructor(scope: Construct, id: string, props: TeamStackProps) {
        super(scope, id, props);
        const { databaseConfig } = props;

        const lambdaConfigs = {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            environment: {
                ...databaseConfig,
                // mode: props.mode,
                MAIN_DATABASE_URL: process.env.MAIN_DATABASE_URL || '',
            },
        };

        const baseLambdaDir = 'dist/';
        const teamsLambdaDir = `${baseLambdaDir}/teams`;
        const postsLambdaDir = `${baseLambdaDir}/posts`;

        const apiResources: IApiResources = {
            subresources: {
                announcements: {
                    endpoints: {
                        GET: {
                            id: 'getPosts',
                            path: `${postsLambdaDir}/getPosts`,
                        },
                        POST: {
                            id: 'createPost',
                            path: `${postsLambdaDir}/createPost`,
                        },
                    },
                    subresources: {
                        '{aid}': {
                            endpoints: {

                                DELETE: {
                                    id: 'deletePost',
                                    path: `${postsLambdaDir}/deletePost`,
                                },
                            },
                        },
                    },
                },
                teams: {
                    endpoints: {
                        GET: {
                            id: 'getTeams',
                            path: `${teamsLambdaDir}/getTeams`,
                        },
                        POST: {
                            id: 'createTeam',
                            path: `${teamsLambdaDir}/createTeam`,
                        },
                    },
                    subresources: {
                        '{id}': {
                            endpoints: {
                                GET: {
                                    id: 'getTeam',
                                    path: `${teamsLambdaDir}/getTeam`,
                                },
                            },
                    },
                },
            },
        }
    }

    this.apiService = new ApiService(
        this,
        apiResources,
        `${Team_STACK_INFO.NAME}-API`,
        lambdaConfigs
    );
    }
}
