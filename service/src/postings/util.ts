import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
import servlessSql from "serverless-mysql";

export const mysql = servlessSql({
  config:{
  host: process.env.DB_HOST!,
  database : process.env.DB_NAME!,
  user     : process.env.DB_USERNAME!,
  password : process.env.DB_PASSWORD!
  }
})


export const formatResponse = (statusCode: number, body: any) : APIGatewayProxyResult => {
  return {
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    "statusCode": statusCode,
    "isBase64Encoded": false,
    "body": JSON.stringify(body)
  }
}