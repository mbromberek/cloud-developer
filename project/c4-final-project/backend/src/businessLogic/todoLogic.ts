import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'
import { TodoAccess } from '../dataLayer/todoAccess'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoAccess = new TodoAccess()

export async function createTodo(
  newTodo: CreateTodoRequest,
  authorization: string
): Promise<TodoItem> {
  const logger = createLogger('createToDo')
  
  //Get Unique ID for new To Do
  const newTodoId = uuid.v4()
  var userId = 'default'

  const split = authorization.split(' ')
  if (split.length > 1){
    const jwtToken = split[1]
    userId = parseUserId(jwtToken)
  }
  logger.info('handler', {'userId': userId})
  
  logger.info('CreateToDo', newTodo)
  

  const item: TodoItem = {
    todoId: newTodoId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo
  }
  
  return await todoAccess.createTodo(item)
  

}

export async function getAllTodosLogic(
  authorization: string
): Promise<TodoItem[]>{
  const logger = createLogger('getTodos')
  
  var userId = 'default'  
  const split = authorization.split(' ')
  if (split.length > 1){
    const jwtToken = split[1]
    userId = parseUserId(jwtToken)
  }
  logger.info('getAllTodosLogic', {'userId': userId})

   const items = await todoAccess.getAllTodos(userId)
   logger.info('getAllTodosLogic', {'items': items})
   
   return items

}
