import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async register(dto: AuthDto, response: Response) {
    const newUser = await this.userService.createUser(dto);
    await this.generateRefreshToken(newUser, response);
    this.generateAccessToken(newUser, response);
  }

  async login(dto: AuthDto, response: Response) {
    const user = await this.userService.getUser(dto);
    await this.generateRefreshToken(user, response);
    this.generateAccessToken(user, response);
  }

  logout(response: Response) {
    this.deleteTokens(response);
  }

  async refresh(req: Request, res: Response) {
    const user = req.user as User;
    this.generateAccessToken(user, res);
  }

  private generateAccessToken(user: User, response: Response) {
    const tokenPayload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '10m', // TODO: Remove magic string
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000), // TODO: Remove magic numbers (15 minutes long in ms)
    });
  }

  private async generateRefreshToken(user: User, response: Response) {
    const tokenPayload = {
      sub: user.id,
      username: user.username,
    };

    const refreshToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '1d', // TODO: Remove magic string
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    await this.userService.updateUser(user.id, { refreshToken: refreshToken });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // TODO: Remove magic numbers (a day long in ms)
    });
  }

  private async deleteTokens(response: Response) {
    response.cookie('Refresh', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now()),
    });

    response.cookie('Authentication', '', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now()),
    });
  }
}
