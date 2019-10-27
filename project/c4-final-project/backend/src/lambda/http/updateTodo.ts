import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info('handler', todoId)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('handler', updatedTodo)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return undefined
}
