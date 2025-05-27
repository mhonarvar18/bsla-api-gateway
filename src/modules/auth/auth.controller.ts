import { Controller, Post, Body, Get, Headers, UnauthorizedException, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RpcExceptionFilter } from 'src/shared/rpc-exception.filter';

@Controller('auth')
@UseFilters(RpcExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: { email: string; password: string }) {
    return this.authService.signup(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  async me(@Headers('Authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    return this.authService.verifyToken(token);
  }
}
