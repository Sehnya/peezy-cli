import { User, CreateUserData, UpdateUserData } from '@/types/User'

export class UserService {
  // In-memory storage for demo purposes
  // In a real app, this would be a database
  private users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ]

  async getAllUsers(): Promise<User[]> {
    // Simulate async operation
    return Promise.resolve(this.users)
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id)
    return Promise.resolve(user || null)
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.push(newUser)
    return Promise.resolve(newUser)
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return Promise.resolve(null)
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      ...userData,
      id: this.users[userIndex].id, // Ensure id is always present
      updatedAt: new Date(),
    }

    this.users[userIndex] = updatedUser
    return Promise.resolve(updatedUser)
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return Promise.resolve(false)
    }

    this.users.splice(userIndex, 1)
    return Promise.resolve(true)
  }
}
