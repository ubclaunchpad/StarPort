import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { ApiService, IApiResources } from './templates/apigateway';
// import * as s3 from 'aws-cdk-lib/aws-s3';
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

        // const myBucket = new s3.Bucket(this, 'MyBucket', {
        //     // S3 bucket configuration
        // });

        const lambdaConfigs = {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'index.handler',
            environment: {
                BUCKET_NAME: process.env.BUCKET_NAME || "",
                BUCKET_ARN: process.env.BUCKET_NAME || "",
                ACCESS_KEY: process.env.IAM_ACCESS_KEY || "",
                SECRET_ACCESS_KEY: process.env.IAM_SECRET_ACCESS_KEY || ""
            },
            role: role,
        };

        const baseLambdaDir = 'dist/wiki';

        const apiResources: IApiResources = {
            subresources: {
                docs: {
                    subresources: {
                        'area': {
                            subresources: {
                                '{area}': {
                                    subresources: { 
                                        'doc': {
                                            subresources: {
                                                '{doc}': {
                                                    subresources: {
                                                        'delete': {
                                                            endpoints: {
                                                                GET: {
                                                                    id: 'deleteDoc',
                                                                    path: `${baseLambdaDir}/deletedoc`,
                                                                },
                                                            }
                                                        },
                                                        'get': {
                                                            endpoints: {
                                                                GET: {
                                                                    id: 'getDoc',
                                                                    path: `${baseLambdaDir}/getdoc`,
                                                                },
                                                            },
                                                        },
                                                        'put': {
                                                            endpoints: {
                                                                GET: {
                                                                    id: 'putDoc',
                                                                    path: `${baseLambdaDir}/putdoc`,
                                                                },
                                                            }
                                                        }
                                                    }
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                // deletedoc: {
                //     endpoints: {
                //         DELETE: {
                //             id: 'deleteDoc',
                //             path: `${baseLambdaDir}/deletedoc`,
                //         },
                //     },
                //     subresources: {
                //         'area': {
                //             subresources: {
                //                 '{area}': {
                //                     subresources: {
                //                         'doc': {
                //                             subresources: {
                //                                 '{doc}': {
                //                                     endpoints: {
                //                                         GET: {
                //                                             id: 'getDoc',
                //                                             path: `${baseLambdaDir}/getdoc`,
                //                                         },
                //                                     },
                //                                 },
                //                             },
                //                         },
                //                     },
                //                 },
                //             },
                //         },
                //     },
                // },
            },
        };

        this.apiService = new ApiService(
            this,
            apiResources,
            `${WIKI_STACK_INFO.NAME}-API`,
            lambdaConfigs,
        );
    }
}
