import { Controller, Get, Param, Post } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';

@Controller('actuadores')
export class ActuadoresController {
  constructor(private readonly actuadoresService: ActuadoresService) {}

  @Get('estado')
  async obtenerEstado() {
    return this.actuadoresService.obtenerEstados();
  }

  @Post(':id/toggle')
  async toggleActuador(@Param('id') id: string) {
    // Simulación de cambio de estado
    return {
      message: `Actuador ${id} recibió solicitud de toggle.`,
    };
  }
}
