/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AgendamentoService } from './agendamento.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('agendamentos')
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv)$/)) {
          return callback(
            new Error('Apenas arquivos CSV são permitidos!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('chegou aqui');
    if (!file) {
      throw new Error('Nenhum arquivo enviado.');
    }

    return await this.agendamentoService.processCSV(file.path);
  }

  @Get('ano/:ano')
  async getAgendamentosPorAno(@Param('ano') ano: string) {
    const anoInt = parseInt(ano, 10);
    if (isNaN(anoInt)) {
      return { error: 'Ano inválido' };
    }
    return this.agendamentoService.getAgendamentosPorAno(anoInt);
  }

  @Get('lista-de-agendamentos')
  async getListaAgendamentos(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return this.agendamentoService.listaAgendamentos(inicio, fim);
  }

  @Get('contagem')
  async getContagemAgendamentos(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    if (!dataInicio || !dataFim) {
      return { error: 'Parâmetros dataInicio e dataFim são obrigatórios' };
    }

    return this.agendamentoService.countAgendamentos(dataInicio, dataFim);
  }
}
