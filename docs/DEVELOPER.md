# Developer Guide

This page is intended for developers who want to contribute to the project. This is the backend engine of Launch Pad. We use AWS CDK to deploy the backend infrastructure.

---

## Prerequisites

[AWS Getting Started](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html)

> Check [Resources](./Resources.md) for a list of links, guides, etc contributors have found helpful for this project.

## Setup

1. Clone the repo

    ```git clone https://github.com/ubclaunchpad/StarPort.git```

### Installation

1. Check you have node and npm installed. you can run the following to see if they are installed

   ```bash
   node -v
   npm -v
   ```

   if not installed refer to their docs for installation steps: [node](https://nodejs.org/en/download), [npm](https://www.npmjs.com/)

2. install Typescript (optionally) globally by running `npm install -g typescript`

3. install AWS CDK  `npm install -g aws-cdk`. verify by running `cdk --version`

4. install dependencies:

   ```bash
   cd starport
   npm install
   ```

## Background

The repository offers/implementes a lot of different things. Here is a briefly overview:

- AWS CDK is used for cloud deployment. Everything in the project gets bundled together with CDK. So CDK is responsible for creating all our resources. APIs, Database, running our scripts and so on.
  - we test our deployment process with Jest (A testing framework)
- The APIs are based on a serverless model. everything in the src folder serves as the source code. With CDK and the AWS Lambda we create our APIs (if familiar with Express, it's same end-result but different implementation)
  - we test our API source code locally by using Jest
  - Additonally we use AWS SAM to live-test our api (lambdas + cdk integration)
- The database is a MySQL flavour of SQL. We use Aurora Serverless to adapt to flexible traffic.
  - We keep our database identicial throughout development by running migration scripts

## Developing

To start developing after you run the setup steps you should do the following.

1. since our api is connected to a database to run it fully we recommend setting up a MySQL server on your machine or if familiar with Docker, on there. After setting up your database, store your db credentials in a `env.local` file at the source directory *(during deployment we will use `.env` that has the cloud database credentials)*

An example of how the file will look

```txt
DB_HOST="localhost"
DB_USERNAME="myuser"
DB_PASSWORD="mypassword"
DB_NAME="mydbname"
```

> Tip: lots of good resources to set up on your laptop quickly, and to verify it's connected first try connecting to it either via your terminal or with a client like `Workbench`

Following steps varies depending on how you want to run the project

### Test-driven Development/Writing tests

you can easily write tests for each of the lambda groups in their test folder. you can run the tests by running

```bash
npm run test:src
```

if you're writing tests for the deployment stacks too you can just do `npm run test`

### Developing with CDK

Cdk is a toolkit for AWS cloudformation. after all our code we want to tell AWS what is what and how things are related. Assuming you have looked up basic AWS CDK resources you can run the follwing to build your assets

```bash
npm run build
cdk synth
```

first transpiles our .ts and the next, synthesizes our stacks and constructs (to make it ready for deployment)

## Local Emulation

To test your lambda functions or API integrations locally, AWS SAM helps here. Sam emulates a porduction environment that AWS would have used to run our project. SAM is a framework for building serverless applications on AWS. It provides a Lambda-like execution environment that lets you locally build, test, and debug applications defined by SAM templates.

To do this, you need to first install [SAM](https://aws.amazon.com/serverless/sam/) and [Docker](https://www.docker.com/).

check you have them installed:

```bash
docker version
```

```bash
sam --version
```

### Running  Lambdas Locally

>Tip: check `package.json` for some frequently used scripts related to this

You can test your functions in two ways:

1. Invoke your lambda function based on a specific predefined event (e.g. an `event.json` file)

    - This will run your lambda function locally and pass in the event as the input and return the output of the function. This is useful for testing your lambdas with testing frameworks like Mocha
    - To run your lambda function locally, run `sam local invoke <function-name> -e <event.json>`
    - To run your lambda function locally with a debugger, run `sam local invoke <function-name> -e <event.json> -d 5858`

2. Run your lambda function locally as an API

    We recommend a test-driven approach to developing your functions. So use this method sparingly as it can take up your battery if you are running it for a long time. It's a good apporach to do your holistic testing before deploying your functions to AWS.

    - To run your lambda function locally as an API, run `sam local start-api`
    - To run your lambda function locally as an API with a debugger, run `sam local start-api -d 5858`

---

> Note: invoking just runs your function and exits. great for integration/e2e testing. Second one keep the function running

---

### Running APIs Locally

Similar to locally testing your lambdas, you can also run and test your APIs locally. THis is helpful when you have a few lambdas or stepfunctions, etc integrated to your API and you want to test the whole flow.

- To run your API locally, run `sam local start-api`
- To run your API locally with a debugger, run `sam local start-api -d 5858`

> Note: For all the sam scripts to run the correct stack, you need to provide the template cdk generates

so before emulation you should run

```bash
npm run build
cdk synth
```

*and then with all your stacks you should provide the relative path to the stack's template - check package.json for examples*

## Deployment

Refer to the AWS deployment guide for more information. However, we only allow cloud deployment via the CI/CD pipeline. So you should not be deploying to AWS manually; in fact you should not have the AWS credentials to do so or we have set up something wrong :).
