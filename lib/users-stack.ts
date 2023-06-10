import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
config();

export class UserStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const createUsers = new lambda.Function(this, 'createUsers', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/createUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getUser = new lambda.Function(this, 'getUser', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const updateUser = new lambda.Function(this, 'updateUser', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/editUser'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getFaculties = new lambda.Function(this, 'getFaculties', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getFaculties'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getPrograms = new lambda.Function(this, 'getPrograms', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getPrograms'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getStandings = new lambda.Function(this, 'getStandings', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getStandings'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getSocials = new lambda.Function(this, 'getSocials', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getSocials'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getProfile = new lambda.Function(this, 'getUserId', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/users/getUserId'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
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

        const components6 = api.root.addResource('socials');
        components6.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getSocials)
        );
    }
}
