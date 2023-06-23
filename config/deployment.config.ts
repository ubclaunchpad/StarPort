export interface IDeployment {
    readonly name: string;
    readonly account: string;
    readonly region: string;
    readonly type: string;
  }

  
  const TEST_ACCOUNT: IDeployment = {
    name: 'test',
    account: process.env.CDK_DEFAULT_ACCOUNT || "",
    region: process.env.CDK_DEFAULT_REGION || "",
    type: 'dev',
  };
  
  export const deploymentEnvironments: IDeployment[] = [TEST_ACCOUNT];