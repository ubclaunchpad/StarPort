import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
config();

export class PostingsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api: apigateway.RestApi = new apigateway.RestApi(
            this,
            'users-api',
            {
                restApiName: 'postings-api',
                defaultCorsPreflightOptions: {
                    allowOrigins: Cors.ALL_ORIGINS,
                },
            }
        );

        const components = api.root.addResource('postings');

        const getPostings = new lambda.Function(this, 'getPostings', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/postings/getPostings'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });
        components.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getPostings)
        );

        const getApplications = new lambda.Function(this, 'getApplications', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/postings/getApplications'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });
        const getAppStatusTypes = new lambda.Function(
            this,
            'getAppStatusTypes',
            {
                runtime: lambda.Runtime.NODEJS_16_X, // execution environment
                code: lambda.Code.fromAsset('dist/postings/getAppStatusTypes'), // code loaded from "lambda" directory
                handler: 'index.handler',
                environment: {
                    DB_HOST: process.env.DB_HOST!,
                    DB_USERNAME: process.env.DB_USERNAME!,
                    DB_PASSWORD: process.env.DB_PASSWORD!,
                    DB_NAME: process.env.DB_NAME!,
                },
            }
        );

        const getPosting = new lambda.Function(this, 'getPosting', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/postings/getPosting'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                DB_HOST: process.env.DB_HOST!,
                DB_USERNAME: process.env.DB_USERNAME!,
                DB_PASSWORD: process.env.DB_PASSWORD!,
                DB_NAME: process.env.DB_NAME!,
            },
        });

        const getUserApplications = new lambda.Function(
            this,
            'getUserApplications',
            {
                runtime: lambda.Runtime.NODEJS_16_X, // execution environment
                code: lambda.Code.fromAsset(
                    'dist/postings/getUserApplications'
                ), // code loaded from "lambda" directory
                handler: 'index.handler',
                environment: {
                    DB_HOST: process.env.DB_HOST!,
                    DB_USERNAME: process.env.DB_USERNAME!,
                    DB_PASSWORD: process.env.DB_PASSWORD!,
                    DB_NAME: process.env.DB_NAME!,
                },
            }
        );

        const components2 = components.addResource('{id}');
        const components3 = components2.addResource('applications');
        const components4 = components3.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getApplications)
        );

        const components9 = components2.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getPosting)
        );

        const components7 = components.addResource('applications');
        const components8 = components7.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getUserApplications)
        );
        const components5 = components7.addResource('status');
        const components6 = components5.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getAppStatusTypes)
        );
    }
}
