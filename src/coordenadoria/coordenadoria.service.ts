/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoordenadoriaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coordenadoria.findMany({
      select: { sigla: true },
      orderBy: { sigla: 'asc' }, 
    });
  }
}
