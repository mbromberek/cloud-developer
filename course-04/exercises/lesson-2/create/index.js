'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)
  console.log('Table Name: ' + groupsTable)
  const itemId = uuid.v4()

  const parsedBody = JSON.parse(event.body)

  const newItem = {
    id: itemId,
    //name: parsedBody.name 
    ...parsedBody //same as doing each parameter name separately like above
    
  }

  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}
