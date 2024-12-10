import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(() => ({ accessToken: 'testToken' })),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const mockResult = { id: "1",email: 'test@example.com', name: 'test', password: 'test'};
      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      const result = await authController.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      });

      expect(result).toEqual(mockResult);
      expect(authService.register).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in a user with valid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        id: "1",
        email: 'test@example.com',
        name: 'John Doe',
      });

      const result = await authController.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'testToken' });
      expect(authService.validateUser).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        authController.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
