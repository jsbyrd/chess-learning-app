import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: AuthDto): Promise<User> {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          ...(dto.role && { role: dto.role }),
        },
      });

      delete user.passwordHash;
      delete user.refreshToken;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
      }
      throw error;
    }
  }

  async getUser(dto: AuthDto): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials Incorrect');

    const passwordMatches = await argon.verify(user.passwordHash, dto.password);

    if (!passwordMatches) throw new ForbiddenException('Credentials Incorrect');

    delete user.passwordHash;
    delete user.refreshToken;

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) throw new ForbiddenException('Credentials Incorrect');

    delete user.passwordHash;
    delete user.refreshToken;

    return user;
  }

  async getUserWithRefreshToken(id: number): Promise<User> {
    const user: User = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) throw new ForbiddenException('Credentials Incorrect');
    delete user.passwordHash;
    return user;
  }

  async updateUser(id: number, data: Partial<User>) {
    await this.prisma.user.update({
      where: {
        id: id,
      },
      data,
    });
  }
}
