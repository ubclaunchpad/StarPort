import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { IDatabaseConfig } from '../config/database.config';
config({ path: `.env.local`, override: true });

export const USER_STACK_INFO: StackInfo = { NAME: 'users-stack' };

export interface UserStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class UserStack extends LPStack {
    public STACK_INFO: StackInfo = USER_STACK_INFO;

    constructor(scope: Construct, id: string, props: UserStackProps) {
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
                restApiName: 'users-api',
                defaultCorsPreflightOptions: {
                    allowOrigins: Cors.ALL_ORIGINS,
                },
            }
        );

        const components = api.root.addResource('users');

        const getUsers = new lambda.Function(this, 'getUsers', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getUsers'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const createUsers = new lambda.Function(this, 'createUsers', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/createUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getUser = new lambda.Function(this, 'getUser', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const deleteUser = new lambda.Function(this, 'deleteUser', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/deleteUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const updateUser = new lambda.Function(this, 'updateUser', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/editUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getFaculties = new lambda.Function(this, 'getFaculties', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getFaculties'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getPrograms = new lambda.Function(this, 'getPrograms', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getPrograms'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        const getStandings = new lambda.Function(this, 'getStandings', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getStandings'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });


        const getProfile = new lambda.Function(this, 'getUserId', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getUserId'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
            },
        });

        components.addMethod('GET', new apigateway.LambdaIntegration(getUsers));
        components.addMethod(
            'POST',
            new apigateway.LambdaIntegration(createUsers)
        );
        const components2 = components.addResource('{id}');
        components2.addMethod('GET', new apigateway.LambdaIntegration(getUser));
        components2.addMethod(
            'PATCH',
            new apigateway.LambdaIntegration(updateUser)
        );
        components2.addMethod(
            'DELETE',
            new apigateway.LambdaIntegration(deleteUser)
        );

        const c3 = components.addResource('me');
        c3.addMethod('GET', new apigateway.LambdaIntegration(getProfile));

        const components3 = api.root.addResource('faculties');
        components3.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getFaculties)
        );

        const components4 = api.root.addResource('programs');
        components4.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getPrograms)
        );

        const components5 = api.root.addResource('standings');
        components5.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getStandings)
        );

       
    }
}
