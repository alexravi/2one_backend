import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { email?: string } | undefined;
    const email = user?.email;

    const adminEmailsRaw = this.configService.get<string>('ADMIN_EMAILS', '');
    const adminEmails = adminEmailsRaw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // If no allowlist is configured, deny by default.
    if (!adminEmails.length) {
      throw new ForbiddenException('Admin access not configured.');
    }

    if (!email) {
      throw new ForbiddenException('Admin access denied.');
    }

    if (!adminEmails.includes(email.toLowerCase())) {
      throw new ForbiddenException('Admin access denied.');
    }

    return true;
  }
}

