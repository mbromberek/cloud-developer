import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { TodoAccess } from '../../dataLayer/todoAccess'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const s3 = new AWS.S3({
  signatureVersion: 'v4' //Use Sigv4 algorithm
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todoAccess = new TodoAccess()


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId
  logger.info('URL Parameters', {'todo': todoId})
  
  const validTodoId = await todoAccess.todoExists(todoId)
  //If no records returned, return a 404 not found error
  if (!validTodoId){
    logger.info('invalid todoId', {'todo': todoId})
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'Todo does not exist'
    }
  }
  
  const attachmentUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const url = getUploadUrl(todoId)
  
  //Perform update
  await todoAccess.addAttachmentUrl(todoId, attachmentUrl)

  logger.info('uploadURL', {'url': url})
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
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
