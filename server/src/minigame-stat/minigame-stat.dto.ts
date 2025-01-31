import { Game, Role } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMinigameStatDto {
  @IsNotEmpty()
  @IsEnum(Game)
  game: Game;

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  score: number;

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  total: number;
}

// model MinigameStat {
//   id Int @id @default(autoincrement())
//   createdAt DateTime @default(now())

//   game Game
//   score Int

//   userId Int
//   user User @relation(fields: [userId], references: [id])

//   @@map("MinigameStats")
// }
