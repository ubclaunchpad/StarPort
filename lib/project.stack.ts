import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
import { IDatabaseConfig } from '../config/database.config';
import { StackInfo } from './util/LPStack';
config();

export const PROJECT_STACK_INFO: StackInfo = { NAME: 'project-stack' };

export interface ProjectStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class ProjectStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ProjectStackProps) {
        super(scope, id, props);

        const { databaseConfig } = props;

        const dataBaseInfo = {
            DB_HOST: databaseConfig.host,
            DB_USERNAME: databaseConfig.user,
            DB_PASSWORD: databaseConfig.password,
            DB_NAME: databaseConfig.database,
        };

        const api: apigateway.RestApi = new apigateway.RestApi(
            this,
            'users-api',
            {
                restApiName: 'projects-api',
                defaultCorsPreflightOptions: {
                    allowOrigins: Cors.ALL_ORIGINS,
                },
            }
        );

        const components = api.root.addResource('projects');

        const getProjects = new lambda.Function(this, 'getProjects', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getProject = new lambda.Function(this, 'getProject', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const createProject = new lambda.Function(this, 'createProject', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getResourceTypes = new lambda.Function(this, 'getResourceTypes', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getProjectRoles = new lambda.Function(this, 'getProjectRoles', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getProjectStatus = new lambda.Function(this, 'getProjectStatus', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/projects/getProjects'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        components.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getProjects)
        );
        components.addMethod(
            'POST',
            new apigateway.LambdaIntegration(createProject)
        );
        const components2 = components.addResource('{id}');
        components2.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getProject)
        );

        const components3 = api.root.addResource('project-roles');
        components3.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getProjectRoles)
        );

        const components4 = api.root.addResource('project-status');
        components4.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getProjectStatus)
        );

        const components5 = api.root.addResource('resource-types');
        components5.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getResourceTypes)
        );
    }
}
