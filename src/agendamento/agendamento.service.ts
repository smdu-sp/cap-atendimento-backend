/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { parse } from 'date-fns';

@Injectable()
export class AgendamentoService {
  constructor(private prisma: PrismaService) {}

  deepEqual(x, y) {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y;
    return x && y && tx === 'object' && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every((key) => this.deepEqual(x[key], y[key]))
      : x === y;
  }

  async processCSV(filePath: string): Promise<{ message: string }> {
    const results: Array<{
      municipe: string;
      tecnico: string;
      processo: string;
      coordenadoria: string;
      datainicio: Date;
      datafim: Date;
      motivo: string;
      rg: string;
      cpf: string;
    }> = [];

    let isFirstRow = true;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';', headers: false }))
        .on('data', async (row) => {
          if (isFirstRow) {
            isFirstRow = false;
            return;
          }

          const datainicio = parse(row[4], 'dd/MM/yyyy HH:mm:ss', new Date());
          const datafim = parse(row[5], 'dd/MM/yyyy HH:mm:ss', new Date());

          const record = {
            municipe: row[0].trim(),
            tecnico: row[1].trim(),
            processo: row[2].trim(),
            coordenadoria: row[3].trim(),
            datainicio,
            datafim,
            motivo: '',
            rg: row[6]?.trim() || '',
            cpf: row[7]?.trim() || '',
          };

          if (!results.find((r) => this.deepEqual(r, record))) {
            results.push(record);
          }
        })
        .on('end', async () => {
          console.log(results);
          for (const i in results) {
            const achou = await this.prisma.agendamento.findFirst({
              where: { ...results[i] },
            });
            if (achou) results.splice(+i, 1);
          }
          if (results.length > 0) {
            await this.prisma.agendamento.createMany({ data: results });
          }
          fs.unlinkSync(filePath);
          resolve({
            message: `Foram inseridos ${results.length} novos registros.`,
          });
        })
        .on('error', (error) => reject(error));
    });
  }
  async getAgendamentosPorAno(ano: number) {
    const inicioDoAno = new Date(ano, 0, 1);
    const fimDoAno = new Date(ano, 11, 31, 23, 59, 59);

    const agendamentosPorCoordenadoria = await this.prisma.agendamento.groupBy({
      by: ['coordenadoria'],
      _count: {
        _all: true,
      },
      where: {
        datainicio: {
          gte: inicioDoAno,
          lte: fimDoAno,
        },
      },
    });

    const contagemMensalGeral = Array(12).fill(0);

    const resultados = await Promise.all(
      agendamentosPorCoordenadoria.map(async (item) => {
        const coordenadoria = item.coordenadoria;

        const contagemMensal = Array(12).fill(0);

        for (let mes = 0; mes < 12; mes++) {
          const inicioDoMes = new Date(ano, mes, 1);
          const fimDoMes = new Date(ano, mes + 1, 0, 23, 59, 59);

          const contagem = await this.prisma.agendamento.count({
            where: {
              coordenadoria,
              datainicio: {
                gte: inicioDoMes,
                lte: fimDoMes,
              },
            },
          });

          contagemMensal[mes] = contagem;
          contagemMensalGeral[mes] += contagem;
        }

        return {
          coordenadoria,
          meses: contagemMensal,
          total: item._count._all,
        };
      }),
    );

    const totalAno = resultados.reduce((sum, item) => sum + item.total, 0);

    return { resultados, totalAno, totalMensal: contagemMensalGeral };
  }

  async listaAgendamentos(dataInicio: Date, dataFim: Date): Promise<any> {
    return this.prisma.agendamento.findMany({
      where: {
        AND: [
          { datainicio: { gte: dataInicio } },
          { datainicio: { lte: dataFim } },
        ],
      },
    });
  }
}
