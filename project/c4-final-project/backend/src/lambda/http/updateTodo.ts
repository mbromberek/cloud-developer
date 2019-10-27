import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { todoExists } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
// const todosIdIndex = process.env.TODOS_ID_INDEX
const logger = createLogger('updateToDo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //Get ToDo ID from URL path
  const todoId = event.pathParameters.todoId
  logger.info('URL Parameters', {'todo': todoId})
  //Get Update details from Body
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info('eventBody', updatedTodo)

  const validTodoId = await todoExists(todoId)
  logger.info('validTodoId', {'validTodoId': validTodoId})
  
  //If no records returned, return a 404 not found error
  if (!validTodoId){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'Todo does not exist'
    }
  }
  
  //Perform update
  await docClient.update({
      TableName: todosTable,
      Key:{
        "todoId": todoId
      },
      UpdateExpression: "set #nm = :todoName, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
          ":todoName": updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ":done": updatedTodo.done   
      },
      ExpressionAttributeNames: {
    //Using expression for name field since name is reserved word for DynamoDB on Updates
        "#nm": "name"
      },
      ReturnValues: "UPDATED_NEW"
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}

