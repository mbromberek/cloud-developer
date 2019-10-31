import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { TodoAccess } from '../../dataLayer/todoAccess'

const todoAccess = new TodoAccess()

const logger = createLogger('deleteToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //Get ToDo ID from URL path
  const todoId = event.pathParameters.todoId
  logger.info('URL Parameters', {'todo': todoId})
  
  //Perform delete
  await todoAccess.deleteTodo(todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }

}
