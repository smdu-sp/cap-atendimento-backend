/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AgendamentoService } from './agendamento.service';
import { AgendamentoController } from './agendamento.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AgendamentoController],
  providers: [AgendamentoService, PrismaService],
})
export class AgendamentoModule {}
