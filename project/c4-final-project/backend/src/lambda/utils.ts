import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE


/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

/*
  Check if Todo exists 
  Returns: True if Todo ID exists in database
           False if Todo ID is not found in database
*/
export async function todoExists (todoId: string){
  // Check if passed ID exists
  const result = await docClient.query({
      TableName : todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
  }).promise()
  
  return (result.Count >0)
}