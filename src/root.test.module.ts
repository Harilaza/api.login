import { Module } from '@nestjs/common';
import { UsersService } from './users/services/users.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
})
export class RootTestModule {}
