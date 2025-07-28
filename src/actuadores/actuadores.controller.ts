// src/actuadores/actuadores.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { CreateActuadorDto } from './dto/create-actuador.dto';
import { ReporteEstadoDto } from './dto/reporte-estado.dto';

@Controller('actuadores')
export class ActuadoresController {
  constructor(private readonly actuadoresService: ActuadoresService) {}

  // Lista todos los actuadores
  @Get()
  findAll() {
    return this.actuadoresService.findAll();
  }

  // Crear un nuevo actuador
  @Post()
  create(@Body() createActuadorDto: CreateActuadorDto) {
    return this.actuadoresService.create(createActuadorDto);
  }

  @Post('reportar-estado')
  async reportarEstado(@Body() dto: ReporteEstadoDto) {
    return this.actuadoresService.reportarEstado(dto);
  }

  // Alternar el relé de un actuador
  @Post(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.actuadoresService.toggle(id);
  }
}
