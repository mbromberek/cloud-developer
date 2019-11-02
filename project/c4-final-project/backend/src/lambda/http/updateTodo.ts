import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
// import * as AWS  from 'aws-sdk'
import { TodoAccess } from '../../dataLayer/todoAccess'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateToDo')

const todoAccess = new TodoAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //Get ToDo ID from URL path
  const todoId = event.pathParameters.todoId
  logger.info('URL Parameters', {'todo': todoId})
  //Get Update details from Body
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('eventBody', updatedTodo)

  const validTodoId = await todoAccess.todoExists(todoId)
  logger.info('validTodoId', {'validTodoId': validTodoId})
  
  //If no records returned, return a 404 not found error
  if (!validTodoId){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'Todo does not exist'
    }
  }
  
  //Perform update
  await todoAccess.updateTodo(todoId, updatedTodo)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}

