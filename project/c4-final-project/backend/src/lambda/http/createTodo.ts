import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

import { parseUserId } from '../../auth/utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const logger = createLogger('createToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('handler Start', event)

  //Get Unique ID for new To Do
  const newTodoId = uuid.v4()
  var userId = 'default'
  
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  if (split.length > 1){
    const jwtToken = split[1]
    userId = parseUserId(jwtToken)
  }
  logger.info('handler', {'userId': userId})
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  logger.info('CreateToDo', newTodo)
  
  const item: TodoItem = {
    todoId: newTodoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo
  }
    
  logger.info('CreateToDo details', item)
  
  await docClient.put({
    TableName: todosTable,
    Item: item
  }).promise()

  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }

}
