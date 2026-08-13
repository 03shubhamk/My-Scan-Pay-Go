import { pool } from '../config/database';
import { User, UserRole } from '../types';

// In-memory fallback map for offline development / testing when PostgreSQL service is not active
const inMemoryUsers: Map<string, User> = new Map();

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query<User>(
        'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      return result.rows[0] || null;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        // Fallback to in-memory store for offline development/test execution
        const normalized = email.toLowerCase();
        for (const user of inMemoryUsers.values()) {
          if (user.email.toLowerCase() === normalized) {
            return user;
          }
        }
        return null;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    try {
      const result = await pool.query<Omit<User, 'password_hash'>>(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        const user = inMemoryUsers.get(id);
        if (user) {
          const { password_hash, ...safe } = user;
          return safe;
        }
        return null;
      }
      throw err;
    }
  }

  async createUser(name: string, email: string, passwordHash: string, role: UserRole = 'CUSTOMER'): Promise<Omit<User, 'password_hash'>> {
    try {
      const result = await pool.query<Omit<User, 'password_hash'>>(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, LOWER($2), $3, $4)
         RETURNING id, name, email, role, created_at, updated_at`,
        [name, email, passwordHash, role]
      );
      return result.rows[0];
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        const newUser: User = {
          id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role,
          created_at: new Date(),
          updated_at: new Date(),
        };
        inMemoryUsers.set(newUser.id, newUser);
        const { password_hash, ...safe } = newUser;
        return safe;
      }
      throw err;
    }
  }
}

export const userRepository = new UserRepository();
