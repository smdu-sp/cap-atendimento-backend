/* eslint-disable prettier/prettier */
// src/ano/ano.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AnoService } from './ano.service';

@Controller('anos')
export class AnoController {
  constructor(private readonly anoService: AnoService) {}

  // Rota para obter os anos distintos
  @Get()
  async getAnos() {
    return this.anoService.findAnos();
  }
}
