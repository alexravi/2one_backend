import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account and returns a JWT access token.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully. Returns JWT token and user info.' })
  @ApiResponse({ status: 400, description: 'Email already exists or validation failed.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Log in an existing user', description: 'Authenticates with email & password and returns a JWT access token.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful. Returns JWT token and user info.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  @ApiOperation({ summary: 'Log in or Register with Google', description: 'Authenticates with Google ID token and returns a JWT access token.' })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({ status: 200, description: 'Login successful. Returns JWT token and user info.' })
  @ApiResponse({ status: 401, description: 'Invalid Google token.' })
  googleLogin(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleLogin(googleAuthDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out the current user', description: 'Client-side logout — drop the JWT token.' })
  @ApiResponse({ status: 201, description: 'Logged out successfully.' })
  logout() {
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token', description: 'Placeholder for token refresh logic.' })
  @ApiResponse({ status: 201, description: 'Token refreshed.' })
  refresh() {
    return { message: 'Refresh endpoint placeholder' };
  }
}
