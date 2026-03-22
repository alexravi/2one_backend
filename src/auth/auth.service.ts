import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, country, primary_language, secondary_language } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    const user = await this.usersService.create({
      email,
      password_hash,
      name,
      country,
      primary_language,
      secondary_language,
    });

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async googleLogin(googleAuthDto: GoogleAuthDto) {
    const { token } = googleAuthDto;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google token');
      }

      const email = payload.email;
      const name = payload.name;

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(uuidv4(), salt);

        user = await this.usersService.create({
          email,
          password_hash,
          name: name || email.split('@')[0],
        });
      }

      const jwtPayload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
