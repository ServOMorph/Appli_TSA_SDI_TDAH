import type { AppDatabase } from '@/data/db'
import type { User } from '@/domain/entities/user'

export class UserRepository {
  constructor(private db: AppDatabase) {}

  async create(user: User): Promise<string> {
    return this.db.users.add(user)
  }

  async getById(id: string): Promise<User | undefined> {
    return this.db.users.get(id)
  }

  async update(user: User): Promise<void> {
    await this.db.users.put(user)
  }

  async delete(id: string): Promise<void> {
    await this.db.users.delete(id)
  }

  async getFirst(): Promise<User | undefined> {
    return this.db.users.toArray().then((users) => users[0])
  }
}
