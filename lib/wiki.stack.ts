import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { config } from 'dotenv';
import { LPStack, StackInfo } from './util/LPStack';
import { ApiService, IApiResources } from './templates/apigateway';
// import * as s3 from 'aws-cdk-lib/aws-s3';
import { Role, ServicePrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IDatabaseConfig } from '../config/database.config';
config();

export const WIKI_STACK_INFO: StackInfo = { NAME: 'hub-wiki-stack' };

export interface WikiStackProps extends cdk.StackProps {
    databaseConfig: IDatabaseConfig;
}
export class WikiStack extends LPStack {
    public STACK_INFO: StackInfo = WIKI_STACK_INFO;
    apiService: ApiService;

    constructor(scope: Construct, id: string, props: WikiStackProps) {
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
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            memorySize: 2048,
            environment: {
                BUCKET_NAME: process.env.BUCKET_NAME || '',
                BUCKET_ARN: process.env.BUCKET_NAME || '',
                ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
                SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
                ...props.databaseConfig,
            },
            role: role,
        };

        const areaLambdaDir = 'dist/wiki/area';
        const docLambdaDir = 'dist/wiki/doc';
        const collectionLambdaDir = 'dist/wiki/collections';
        const itemsLambdaDir = 'dist/wiki/collections/items';

        const apiResources: IApiResources = {
            subresources: {
                collections: {
                    subresources: {
                        '{collectionid}': {
                            endpoints: {
                                GET: {
                                    id: 'getCollection',
                                    path: `${collectionLambdaDir}/getCollection`,
                                },
                                DELETE: {
                                    id: 'deleteCollection',
                                    path: `${collectionLambdaDir}/deleteCollection`,
                                },
                                PATCH: {
                                    id: 'updateCollection',
                                    path: `${collectionLambdaDir}/updateCollection`,
                                },
                            },
                            subresources: {
                                items: {
                                    endpoints: {
                                        POST: {
                                            id: 'addItem',
                                            path: `${itemsLambdaDir}/addItem`,
                                        },
                                    },
                                    subresources: {
                                        '{itemid}': {
                                            endpoints: {
                                                DELETE: {
                                                    id: 'deleteItem',
                                                    path: `${itemsLambdaDir}/removeItem`,
                                                },
                                                GET: {
                                                    id: 'getItem',
                                                    path: `${itemsLambdaDir}/getItem`,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    endpoints: {
                        GET: {
                            id: 'getCollections',
                            path: `${collectionLambdaDir}/getCollections`,
                        },
                        POST: {
                            id: 'createCollection',
                            path: `${collectionLambdaDir}/createCollection`,
                        },
                    },
                },
                doc: {
                    subresources: {
                        '{docid}': {
                            endpoints: {
                                GET: {
                                    id: 'getDoc',
                                    path: `${docLambdaDir}/getDoc`,
                                },
                            },
                        },
                    },
                },
                areas: {
                    endpoints: {
                        GET: {
                            id: 'getAreas',
                            path: `${areaLambdaDir}/getAreas`,
                        },
                        POST: {
                            id: 'createArea',
                            path: `${areaLambdaDir}/createArea`,
                        },
                    },
                    subresources: {
                        '{areaid}': {
                            endpoints: {
                                GET: {
                                    id: 'getArea',
                                    path: `${areaLambdaDir}/getArea`,
                                },
                                DELETE: {
                                    id: 'deleteArea',
                                    path: `${areaLambdaDir}/deleteArea`,
                                },
                                PATCH: {
                                    id: 'updateArea',
                                    path: `${areaLambdaDir}/updateArea`,
                                },
                            },
                            subresources: {
                                docs: {
                                    endpoints: {
                                        POST: {
                                            id: 'createDoc',
                                            path: `${docLambdaDir}/createDoc`,
                                        },
                                    },
                                    subresources: {
                                        '{docid}': {
                                            endpoints: {
                                                DELETE: {
                                                    id: 'deleteDoc',
                                                    path: `${docLambdaDir}/deleteDoc`,
                                                },
                                                GET: {
                                                    id: 'getDoc',
                                                    path: `${docLambdaDir}/getDoc`,
                                                },
                                                PUT: {
                                                    id: 'putDoc',
                                                    path: `${docLambdaDir}/putDoc`,
                                                },
                                            },
                                            // subresources: {
                                            //     'content': {
                                            //         endpoints: {
                                            //             GET: {
                                            //                 id: 'getContent',
                                            //                 path: `${baseLambdaDir}/getContent`,
                                            //             },
                                            //         },
                                            //     },
                                            // },
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
            lambdaConfigs
        );
    }
}
