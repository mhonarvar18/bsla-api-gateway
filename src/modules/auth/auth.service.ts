import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async signup(data: { email: string; password: string }) {
    return lastValueFrom(
      this.authClient.send('signup', data).pipe(
        catchError((err) => {
          return throwError(() => new BadRequestException(err?.message || 'Signup failed'));
        }),
      ),
    );
  }

  async login(data: { email: string; password: string }) {
    return lastValueFrom(
      this.authClient.send('login', data).pipe(
        catchError((err) => {
          return throwError(() => new UnauthorizedException(err?.message || 'Invalid credentials'));
        }),
      ),
    );
  }

  async verifyToken(token: string) {
    return lastValueFrom(
      this.authClient.send('verify-token', { token }).pipe(
        catchError((err) => {
          return throwError(() => new UnauthorizedException(err?.message || 'Invalid token'));
        }),
      ),
    );
  }
}
