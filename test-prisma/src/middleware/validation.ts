import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { createError } from './errorHandler'

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
})

export const validateUser = (req: Request, _res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body)

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ')
    return next(createError(message, 400))
  }

  next()
}
