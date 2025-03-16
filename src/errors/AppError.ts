import { HttpStatusCode } from "../constants/http"

class AppError extends Error{
  public readonly statusCode: HttpStatusCode
  public readonly errorCode?: string
  public readonly isOperational: boolean;

  constructor(statusCode: HttpStatusCode, message: string, errorCode?: string, isOperational: boolean = true){
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational

    //stack trace ( only in dev mode)
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default AppError
