import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
import { IDatabaseConfig } from '../config/database.config';
import { StackInfo } from './util/LPStack';
config({ path: `.env.local`, override: true });

export const POSTING_STACK_INFO: StackInfo = { NAME: 'posting-stack' };

export interface PostingStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}

export class PostingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PostingStackProps) {
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
                ...dataBaseInfo,
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
                ...dataBaseInfo,
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
                    ...dataBaseInfo,
                },
            }
        );

        const getPosting = new lambda.Function(this, 'getPosting', {
            runtime: lambda.Runtime.NODEJS_16_X, // execution environment
            code: lambda.Code.fromAsset('dist/postings/getPosting'), // code loaded from "lambda" directory
            handler: 'index.handler',
            environment: {
                ...dataBaseInfo,
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
                    ...dataBaseInfo,
                },
            }
        );

        const components2 = components.addResource('{id}');
        const components3 = components2.addResource('applications');
        components3.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getApplications)
        );

        components2.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getPosting)
        );

        const components7 = components.addResource('applications');
        components7.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getUserApplications)
        );
        const components5 = components7.addResource('status');
        components5.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getAppStatusTypes)
        );
    }
}
