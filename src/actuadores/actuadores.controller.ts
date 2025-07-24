import { Controller, Get } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';

@Controller('actuadores')
export class ActuadoresController {
  constructor(private readonly actuadoresService: ActuadoresService) {}

  @Get('estado')
  async obtenerEstado() {
    return this.actuadoresService.obtenerEstados();
  }
}
