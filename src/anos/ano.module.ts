/* eslint-disable prettier/prettier */
// src/ano/ano.module.ts

import { Module } from '@nestjs/common';
import { AnoController } from './ano.controller';
import { AnoService } from './ano.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AnoController], // Registra o controller
  providers: [AnoService, PrismaService], // Registra o service e o PrismaService
})
export class AnoModule {}
