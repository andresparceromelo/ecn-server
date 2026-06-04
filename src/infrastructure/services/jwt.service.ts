import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export class JwtService {
  sign(payload: JwtPayload): string {
    const options: SignOptions = {};
    return jwt.sign(payload, env.JWT_SECRET, { ...options, expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
