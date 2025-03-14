/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { PrismaModule } from './prisma/prisma.module';

import { VitalidadeModule } from './vitalidade/vitalidade.module';
import { ConfigModule } from '@nestjs/config';
import { AgendamentoModule } from './agendamento/agendamento.module';
import { CoordenadoriaModule } from './coordenadoria/coordenadoria.module';
import { AnoModule } from './anos/ano.module';


@Global()
@Module({
  imports: [    
    AnoModule,
    CoordenadoriaModule,
    AgendamentoModule,
    UsuariosModule,
    AuthModule,
    PrismaModule,
    VitalidadeModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
