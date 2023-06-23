#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { UserStack } from '../lib/user.stack';
import { USER_STACK_INFO } from '../lib/user.stack';
import { DATABASE_CONFIG } from '../config/database.config';
import { deploymentEnvironments } from '../config/deployment.config';
import { config } from 'dotenv';

config();

const app = new cdk.App();

new UserStack(app, USER_STACK_INFO.NAME, {
    env: deploymentEnvironments[0],
    databaseConfig: DATABASE_CONFIG.getDBConfig(),
});
