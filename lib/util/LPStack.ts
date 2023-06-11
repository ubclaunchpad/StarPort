import * as cdk from 'aws-cdk-lib';

export abstract class LPStack extends cdk.Stack {
    public abstract readonly STACK_INFO: StackInfo;
    // constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    //     super(scope, id, props);
    // }
    // abstract createResources(): void;
}

export interface StackInfo {
    NAME: string;
}
