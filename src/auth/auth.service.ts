import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/entities/user.entity';
import {
  LoginDTO,
  RegisterDTO,
  UpdateUserDTO,
  AuthResponse,
} from 'src/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(credentials: RegisterDTO): Promise<AuthResponse> {
    try {
      const findUserUsername = await this.userRepo.findOne({
        where: { username: credentials.username },
      });
      const findUserEmail = await this.userRepo.findOne({
        where: { email: credentials.email },
      });
      if (findUserUsername) {
        throw new ConflictException('The username has already been taken');
      }
      if (findUserEmail) {
        throw new ConflictException('An email has already been taken');
      }
      const user = this.userRepo.create(credentials);
      await user.save();
      const payload = { username: user.username, email: user.email };
      const token = this.jwtService.sign(payload);
      return { ...user.toJSON(), token };
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException(
          'The Username and Email has already been taken',
        );
      }
      if (err.status === 409) {
        throw new ConflictException(err.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDTO): Promise<AuthResponse> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { username: user.username, email: user.email };
      const token = this.jwtService.sign(payload);
      return { ...user.toJSON(), token };
    } catch (err) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async findCurrentUser(
    username: string,
    email: string,
  ): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({ where: { username, email } });
    const payload = { username: user.username, email: user.email };
    const token = this.jwtService.sign(payload);
    return { ...user.toJSON(), token };
  }

  async updateUser(
    username: string,
    email: string,
    data: UpdateUserDTO,
  ): Promise<AuthResponse> {
    await this.userRepo.update({ username, email }, data);
    const user = await this.userRepo.findOne({ where: { username, email } });
    const payload = { username: user.username, email: user.email };
    const token = this.jwtService.sign(payload);
    return { ...user.toJSON(), token };
  }
}
