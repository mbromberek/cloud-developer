import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly todoUsrIndx = process.env.TODOS_USR_INDX
    ) {
  }

  /*
    Get all todos for the passed userId
  */
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const logger = createLogger('getTodos')
    logger.info('getAllTodos Access', {'position':'start', 'userId': userId})

    const result = await this.docClient.query({
      TableName : this.todoTable,
      IndexName : this.todoUsrIndx,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }).promise()
    const items = result.Items

    return items as TodoItem[]

  }

  /*
    Create to do in DynamoDB
  */
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem
  }
  
  /*
  Check if Todo exists 
  Returns: True if Todo ID exists in database
           False if Todo ID is not found in database
*/
  async todoExists (todoId: string){
    // Check if passed ID exists
    const result = await this.docClient.query({
      TableName : this.todoTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
    }).promise()
  
    return (result.Count >0)
  }
  
  async updateTodo(todoId: string, updatedTodo: UpdateTodoRequest): Promise<UpdateTodoRequest>{
    await this.docClient.update({
        TableName: this.todoTable,
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
  
    return updatedTodo
  }

  async addAttachmentUrl(todoId: string, attachmentUrl: string){
    await this.docClient.update({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()
  }
  
  async deleteTodo(todoId: string){
    await this.docClient.delete({
      TableName: this.todoTable,
      Key:{
        "todoId": todoId
      }
    }).promise()
  }
  
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}


