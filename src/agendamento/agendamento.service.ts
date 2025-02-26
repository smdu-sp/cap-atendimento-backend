/* eslint-disable prettier/prettier */
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { parse } from 'date-fns'; // Importando a função para parse de data

@Injectable()
export class AgendamentoService {
  constructor(private prisma: PrismaService) {}

  deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
        ok(x).every(key => this.deepEqual(x[key], y[key]))
    ) : (x === y);
  }

  async processCSV(filePath: string): Promise<{ message: string }> {
    const results: Array<{ 
      municipe: string;
      tecnico: string;
      processo: string;
      coordenadoria: string;
      datainicio: Date;      
      datafim: Date;      
      resumo: string;
    }> = []; // Definição do tipo correta

    let isFirstRow = true; // Variável para controlar a primeira linha

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';', headers: false })) // headers: false para não usar a primeira linha como cabeçalhos
        .on('data', async (row) => {
          // Ignorar a primeira linha
          if (isFirstRow) {
            isFirstRow = false;
            return; // Sai sem processar a primeira linha
          }

          // Formatar as datas para o formato aceito pelo JavaScript
          const datainicio = parse(row[4], 'dd/MM/yyyy HH:mm:ss', new Date());
          const datafim = parse(row[5], 'dd/MM/yyyy HH:mm:ss', new Date());

          const record = {
            municipe: row[0].trim(),
            tecnico: row[1].trim(),
            processo: row[2].trim(),
            coordenadoria: row[3].trim(),
            datainicio,            
            datafim,            
            resumo: ''            
          };

            if (!results.find((r) => this.deepEqual(r, record))) {
                results.push(record);
            }
        })
        .on('end', async () => {
            console.log(results);
            for (const i in results) {
                const achou = await this.prisma.agendamento.findFirst({
                    where: { ...results[i] }
                })
                if (achou) results.splice(+i, 1);
            }
            if (results.length > 0) {
                await this.prisma.agendamento.createMany({ data: results });
            }
            fs.unlinkSync(filePath); // Deleta o arquivo após o processamento
            resolve({message: `Foram inseridos ${results.length} novos registros.`});
        })
        .on('error', (error) => reject(error));
    });
  }
}
