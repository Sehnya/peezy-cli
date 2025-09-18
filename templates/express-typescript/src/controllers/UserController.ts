import { Request, Response, NextFunction } from 'express'
import { UserService } from '@/services/UserService'
import { createError } from '@/middleware/errorHandler'
import { logger } from '@/utils/logger'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers()
      res.json({
        success: true,
        data: users,
        count: users.length,
      })
    } catch (error) {
      logger.error('Error fetching users:', error)
      next(createError('Failed to fetch users', 500))
    }
  }

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      if (!id) {
        return next(createError('User ID is required', 400))
      }
      const user = await this.userService.getUserById(id)

      if (!user) {
        return next(createError('User not found', 404))
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      logger.error('Error fetching user:', error)
      next(createError('Failed to fetch user', 500))
    }
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body
      const user = await this.userService.createUser(userData)

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      })
    } catch (error) {
      logger.error('Error creating user:', error)
      next(createError('Failed to create user', 500))
    }
  }

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userData = req.body

      if (!id) {
        return next(createError('User ID is required', 400))
      }

      const user = await this.userService.updateUser(id, userData)

      if (!user) {
        return next(createError('User not found', 404))
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      })
    } catch (error) {
      logger.error('Error updating user:', error)
      next(createError('Failed to update user', 500))
    }
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      if (!id) {
        return next(createError('User ID is required', 400))
      }
      const deleted = await this.userService.deleteUser(id)

      if (!deleted) {
        return next(createError('User not found', 404))
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      logger.error('Error deleting user:', error)
      next(createError('Failed to delete user', 500))
    }
  }
}
