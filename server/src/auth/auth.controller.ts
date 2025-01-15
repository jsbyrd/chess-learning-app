import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.register(dto, response);
  }

  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(dto, response);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(dto, response);
  }
}
