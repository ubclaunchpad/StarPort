import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { ApiService, IApiResources } from './templates/apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Role, ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
config();

export const WIKI_STACK_INFO: StackInfo = { NAME: 'wiki-stack' };

export class WikiStack extends LPStack {
    public STACK_INFO: StackInfo = WIKI_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const role = new Role(this, 'MyLambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        });

        // Attach a policy statement to the IAM role
        const policyStatement = new PolicyStatement();
        policyStatement.addActions('s3:GetObject');
        policyStatement.addResources('arn:aws:s3:::lp-doc');
        role.addToPolicy(policyStatement);

        const myBucket = new s3.Bucket(this, 'MyBucket', {
            // S3 bucket configuration
        });

        const lambdaConfigs = {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            environment: {
                BUCKET_NAME: myBucket.bucketName,
                BUCKET_ARN: myBucket.bucketArn,
            },
            role: role,
        };

        const baseLambdaDir = 'dist/wiki';

        const apiResources: IApiResources = {
            subresources: {
                docs: {
                    subresources: {
                        '{area}': {
                            subresources: {
                                '{doc}': {
                                    endpoints: {
                                        GET: {
                                            id: 'getDoc',
                                            path: `${baseLambdaDir}/getdoc`,
                                        },
                                    },
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
            `${WIKI_STACK_INFO.NAME}-API`,
            lambdaConfigs,
            myBucket
        );
    }
}
