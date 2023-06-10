import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { config } from 'dotenv';
config();

export class ProjectsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api: apigateway.RestApi = new apigateway.RestApi(
        this,
        "users-api",
        {
          restApiName: "projects-api",
          defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
          },
        }
      );


      const components = api.root.addResource("projects");

      const getProjects = new lambda.Function(this, 'getProjects', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });

      const getProject = new lambda.Function(this, 'getProject', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });


      const createProject = new lambda.Function(this, 'createProject', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });


      const getResourceTypes = new lambda.Function(this, 'getResourceTypes', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });

      const getProjectRoles = new lambda.Function(this, 'getProjectRoles', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });

      const getProjectStatus = new lambda.Function(this, 'getProjectStatus', {
        runtime: lambda.Runtime.NODEJS_16_X,    // execution environment
        code: lambda.Code.fromAsset('dist/projects/getProjects'),  // code loaded from "lambda" directory
        handler: 'index.handler',
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_USERNAME: process.env.DB_USERNAME!,
            DB_PASSWORD: process.env.DB_PASSWORD!,
            DB_NAME: process.env.DB_NAME!,
        } 
      });


      components.addMethod("GET", new apigateway.LambdaIntegration(getProjects));  
      components.addMethod("POST", new apigateway.LambdaIntegration(createProject)); 
      const components2 = components.addResource("{id}");
      components2.addMethod("GET", new apigateway.LambdaIntegration(getProject));  
      // components2.addMethod("PATCH", new apigateway.LambdaIntegration(updateUser));  

      // const c3 = components.addResource("me"); 
      // c3.addMethod("GET", new apigateway.LambdaIntegration(getProfile));

      const components3 = api.root.addResource("project-roles");
      components3.addMethod("GET", new apigateway.LambdaIntegration(getProjectRoles));

      const components4 = api.root.addResource("project-status");
      components4.addMethod("GET", new apigateway.LambdaIntegration(getProjectStatus));

      const components5 = api.root.addResource("resource-types");
      components5.addMethod("GET", new apigateway.LambdaIntegration(getResourceTypes));
  }
}
