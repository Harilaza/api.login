import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';  
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,  // Ajoutez UsersService ici
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'testToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);  // Récupérer UsersService
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: "1",
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedPassword',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const result = await authService.register(
        'test@example.com',
        'password123',
        'John Doe',
      );

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        password: mockUser.password
      });
      
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user already exists', async () => {
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
          id: "1",
          email: 'test@example.com',
          name: 'John Doe',
          password: 'hashedPassword',
        });
      
        await expect(
          authService.register('test@example.com', 'password123', 'John Doe')
        ).rejects.toThrow(UnauthorizedException);
      });
      
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: "1",
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({ id: "1", email: 'test@example.com', name: 'John Doe' });
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: "1",
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });
});
