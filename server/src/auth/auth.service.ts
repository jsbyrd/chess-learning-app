import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
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
    await this.handleTokensAndCookies(newUser, response);
  }

  async login(dto: AuthDto, response: Response) {
    const user = await this.userService.getUser(dto);
    await this.handleTokensAndCookies(user, response);
  }

  async handleTokensAndCookies(user: User, response: Response) {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '15m', // TODO: Remove magic string
      secret: this.configService.get('JWT_ACCESS_SECRET'),
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '1d', // TODO: Remove magic string
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    await this.userService.updateUser(user.id, { refreshToken });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 15 * 60 * 1000), // TODO: Remove magic numbers (15 minutes long in ms)
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // TODO: Remove magic numbers (a day long in ms)
    });
  }
}
