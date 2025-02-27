/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { CoordenadoriaService } from './coordenadoria.service';

@Controller('coordenadorias')
export class CoordenadoriaController {
  constructor(private readonly coordenadoriaService: CoordenadoriaService) {}

  @Get()
  async getCoordenadorias() {
    return this.coordenadoriaService.findAll();
  }
}
