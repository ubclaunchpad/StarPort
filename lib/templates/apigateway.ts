import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct, IDependable } from 'constructs';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';

export type Method = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'PATCH' | 'DELETE';

export interface ILambdaConfig {
    id: string;
    path: string;
}

export interface ILambdaEnvironment {
    runtime: lambda.Runtime;
    handler: string;
    environment: { [key: string]: string };
    role?: Role;
}

export type IEndpoint = {
    GET?: ILambdaConfig;
    POST?: ILambdaConfig;
    PUT?: ILambdaConfig;
    OPTIONS?: ILambdaConfig;
    PATCH?: ILambdaConfig;
    DELETE?: ILambdaConfig;
};

export interface IApiResources {
    subresources?: { [name: string]: IApiResources };
    endpoints?: IEndpoint;
}

export class ApiService {
    private readonly lambdaConfig;
    private lambdas: { [name: string]: lambda.Function } = {};
    private scope: Construct;

    constructor(
        scope: Construct,
        apiResources: IApiResources,
        id: string,
        lambdaConfig: ILambdaEnvironment,
        deps?: IDependable
    ) {
        this.lambdaConfig = lambdaConfig;
        this.scope = scope;

        const restApi: apigateway.RestApi = new apigateway.RestApi(scope, id, {
            restApiName: id,
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
            },
            cloudWatchRole: true,
        });

        if (deps) {
            restApi.node.addDependency(deps);
        }

        this.defineResources(restApi.root, apiResources);
    }

    defineResources(
        restApi: apigateway.IResource,
        resource: IApiResources
    ): void {
        resource.endpoints &&
            Object.entries(resource.endpoints).forEach(([method, lambdaId]) => {
                const lambda = this.getLambda(lambdaId);
                restApi.addMethod(
                    method,
                    new apigateway.LambdaIntegration(lambda, {
                        allowTestInvoke: true,
                    }),
                    {
                        methodResponses: [
                            { statusCode: '200' },
                            { statusCode: '400' },
                        ],
                    }
                );
            });

        const subresources = resource.subresources;

        if (!resource.subresources) {
            return;
        }

        for (const subRoute in subresources) {
            this.defineResources(
                restApi.addResource(subRoute),
                subresources[subRoute]
            );
        }
    }

    getLambda(lambdaConfig: ILambdaConfig): lambda.Function {
        if (!this.lambdas[lambdaConfig.id]) {
            this.initializeLambda(lambdaConfig);
        }
        return this.lambdas[lambdaConfig.id];
    }

    initializeLambda(lambdaConfig: ILambdaConfig) {
        this.lambdas[lambdaConfig.id] = new lambda.Function(
            this.scope,

            lambdaConfig.id,
            {
                timeout: Duration.minutes(1),
                ...this.lambdaConfig,
                code: lambda.Code.fromAsset(lambdaConfig.path),
            }
        );
    }
}
