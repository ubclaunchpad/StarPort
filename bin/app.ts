#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UserStack } from '../lib/users-stack';
import { ProjectsStack } from '../lib/projects-stack';
import { PostingsStack } from '../lib/postings-stack';

// This is the entry point of your CDK app. The `cdk.json` file tells the CDK Toolkit how to execute the app.
const app = new cdk.App();
const usersStack: UserStack = new UserStack(app, "users-stack", {
});

const projectsStack: UserStack = new ProjectsStack(app, "projects-stack", {
});

const postingsStack: UserStack = new PostingsStack(app, "postings-stack", {
});