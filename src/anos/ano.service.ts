/* eslint-disable prettier/prettier */
// src/ano/ano.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnoService {
  constructor(private prisma: PrismaService) {}

  // Método para buscar os anos distintos da tabela agendamento
  async findAnos() {
    // Busca os registros distintos de "datainicio"
    const anos = await this.prisma.agendamento.findMany({
      select: {
        datainicio: true, 
      },
      distinct: ['datainicio'],
    });

    // Extrai o ano de cada data
    // eslint-disable-next-line prettier/prettier
    const anosDistintos = anos.map((agendamento) => new Date(agendamento.datainicio).getFullYear());
    
    // Retorna os anos únicos, removendo duplicados
    return [...new Set(anosDistintos)];
  }
}
