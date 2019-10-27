import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { todoExists } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4' //Use Sigv4 algorithm
})
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId
  logger.info('URL Parameters', {'todo': todoId})
  
  const validTodoId = await todoExists(todoId)  
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
  
  const attachmentUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const url = getUploadUrl(todoId)
  
  //Perform update
  await docClient.update({
      TableName: todosTable,
      Key:{
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }

}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
