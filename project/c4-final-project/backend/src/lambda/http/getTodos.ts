import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodos')

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('handler', event)
  
  var userId = 'default'  
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  if (split.length > 1){
    const jwtToken = split[1]
    userId = parseUserId(jwtToken)
  }
  logger.info('handler', {'userId': userId})


  const result = await docClient.scan({
    TableName: todosTable,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {':userId': userId}
  }).promise()

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }

}
