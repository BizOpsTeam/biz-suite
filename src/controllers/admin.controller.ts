
import { Request, Response, NextFunction } from "express"

export const registerAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("Endpoint is working") 
  next()
}
