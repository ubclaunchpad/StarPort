#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UserStack } from '../lib/user.stack';
import { PROJECT_STACK_INFO, ProjectStack } from '../lib/project.stack';
import { POSTING_STACK_INFO, PostingStack } from '../lib/posting.stack';
import { USER_STACK_INFO } from '../lib/user.stack';
import { DATABASE_CONFIG } from '../config/database.config';

// This is the entry point of your CDK app. The `cdk.json` file tells the CDK Toolkit how to execute the app.
const app = new cdk.App();
new UserStack(app, USER_STACK_INFO.NAME, {
    databaseConfig: DATABASE_CONFIG.getDBConfig(),
});

new ProjectStack(app, PROJECT_STACK_INFO.NAME, {
    databaseConfig: DATABASE_CONFIG.getDBConfig(),
});

new PostingStack(app, POSTING_STACK_INFO.NAME, {
    databaseConfig: DATABASE_CONFIG.getDBConfig(),
});
