# Developer Guide

This page is intended for developers who want to contribute to the project. This is the backend engine of Launch Pad. We use AWS CDK to deploy the backend infrastructure.

*AWS CDK is a software development framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation. It offers a high-level object-oriented abstraction to define AWS resources imperatively using the power of modern programming languages. Using the CDK’s library of infrastructure constructs, you can easily encapsulate AWS best practices in your infrastructure definition and share it without worrying about boilerplate logic.*

## Prerequisites

[AWS Getting Started](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html)

## Setup

1. Clone the repo

    ```git clone https://github.com/ubclaunchpad/StarPort.git```

2. Installation

- install Typescript globally by running `npm install -g typescript`
- install AWS CDK  `npm install -g aws-cdk`
- install dependencies `npm install`

## Development

Even though the project is the infrastructure as code, we house all our logic here to speed up development as the scope of the project is still manageable.
Still, we want to keep the codebase as separated as possbile. Inside the `service` directory, we have a `src` folder that contains all the logic for the Lambdas.

### Running  Lambdas Locally

To avoid the hassle of deploying the Lambdas to AWS every time we make a change, we can run and test the Lambdas locally. We do this by using the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html). SAM is a framework for building serverless applications on AWS. It provides a Lambda-like execution environment that lets you locally build, test, and debug applications defined by SAM templates.

You can test your functions in two ways:

1. Invoke your lambda function based on a specific predefined event (e.g. an `event.json` file)

    - This will run your lambda function locally and pass in the event as the input and return the output of the function. This is useful for testing your lambdas with testing frameworks like Mocha
    - To run your lambda function locally, run `sam local invoke <function-name> -e <event.json>`
    - To run your lambda function locally with a debugger, run `sam local invoke <function-name> -e <event.json> -d 5858`

2. Run your lambda function locally as an API

    We recommend a test-driven approach to developing your functions. So use this method sparingly as it can take up your battery if you are running it for a long time. It's a good apporach to do your holistic testing before deploying your functions to AWS.

    - To run your lambda function locally as an API, run `sam local start-api`
    - To run your lambda function locally as an API with a debugger, run `sam local start-api -d 5858`

### Running APIs Locally

Similar to locally testing your lambdas, you can also run and test your APIs locally. THis is helpful when you have a few lambdas or stepfunctions, etc integrated to your API and you want to test the whole flow.

- To run your API locally, run `sam local start-api`
- To run your API locally with a debugger, run `sam local start-api -d 5858`

## Deployment

Refer to the AWS deployment guide for more information. However, we only allow cloud deployment via the CI/CD pipeline. So you should not be deploying to AWS manually; in fact you should not have the AWS credentials to do so or we have set up something wrong :).


## Useful commands

- `npm run build`   compile typescript to js
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `cdk deploy`      deploy this stack to your default AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
