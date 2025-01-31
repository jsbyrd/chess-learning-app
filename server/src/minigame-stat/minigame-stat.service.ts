import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MinigameStat, User } from '@prisma/client';
import { CreateMinigameStatDto } from './minigame-stat.dto';

@Injectable()
export class MinigameStatService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMinigameStatDto, user: User): Promise<MinigameStat> {
    try {
      return await this.prisma.minigameStat.create({
        data: {
          game: dto.game,
          score: dto.score,
          total: dto.total,
          userId: user.id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Could not create MinigameStat');
      }
      throw error;
    }
  }

  async findAllByUser(user: User): Promise<MinigameStat[]> {
    return this.prisma.minigameStat.findMany({
      where: { userId: user.id },
    });
  }

  async delete(id: number): Promise<MinigameStat> {
    try {
      return await this.prisma.minigameStat.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Could not delete MinigameStat');
      }
      throw error;
    }
  }
}
