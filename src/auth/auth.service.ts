/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      role: 'user', // Default role
    });

    await this.usersRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    // Generate token for the new user
    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'role', 'createdAt'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
