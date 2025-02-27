/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CoordenadoriaService } from './coordenadoria.service';
import { CoordenadoriaController } from './coordenadoria.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CoordenadoriaController],
  providers: [CoordenadoriaService, PrismaService],
})
export class CoordenadoriaModule {}
