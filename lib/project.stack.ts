import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { IDatabaseConfig } from '../config/database.config';
import { ApiService, IApiResources } from './templates/apigateway';
config();

export const Project_STACK_INFO: StackInfo = { NAME: 'projects-stack' };
export interface ProjectStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class ProjectStack extends LPStack {
    public STACK_INFO: StackInfo = Project_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: ProjectStackProps) {
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
        const projectsLambdaDir = `${baseLambdaDir}/projects`;

        const apiResources: IApiResources = {
            subresources: {
                projects: {
                    endpoints: {
                        GET: {
                            id: 'getProjects',
                            path: `${projectsLambdaDir}/getProjects`,
                        },
                        POST: {
                            id: 'createProject',
                            path: `${projectsLambdaDir}/createProject`,
                        },
                    },
                    // subresources: {
                    //     '{id}': {
                    //         endpoints: {
                    //             GET: {
                    //                 id: 'getProject',
                    //                 path: `${projectsLambdaDir}/getProject`,
                    //             },
                    //             PATCH: {
                    //                 id: 'editProject',
                    //                 path: `${projectsLambdaDir}/editProject`,
                    //             },
                    //             DELETE: {
                    //                 id: 'deleteProject',
                    //                 path: `${projectsLambdaDir}/deleteProject`,
                    //             },
                    //         },
                    //
                    //     },
                    //
                    // },
                },
            },
        };

        this.apiService = new ApiService(
            this,
            apiResources,
            `${Project_STACK_INFO.NAME}-API`,
            lambdaConfigs
        );
    }
}
