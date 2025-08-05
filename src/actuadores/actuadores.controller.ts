// src/actuadores/actuadores.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ActuadoresService } from './actuadores.service';
import { CreateActuadorDto } from './dto/create-actuador.dto';

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

  // Obtener IP del gateway asociado (consulta por apiKey)
  @Get('gateway-ip/:apiKey')
  async obtenerGatewayIp(@Param('apiKey') apiKey: string) {
    return this.actuadoresService.obtenerGatewayIp(apiKey);
  }

  // ✅ Restaurado: Encender motor
  @Post(':id/encender-motor')
  encenderMotor(@Param('id') id: string) {
    return this.actuadoresService.encenderMotor(id);
  }

  // ✅ Restaurado: Apagar motor
  @Post(':id/apagar-motor')
  apagarMotor(@Param('id') id: string) {
    return this.actuadoresService.apagarMotor(id);
  }

  // ✅ Restaurado: Reiniciar gateway
  @Post(':id/reiniciar-gateway')
  reiniciarGateway(@Param('id') id: string) {
    return this.actuadoresService.reiniciarGateway(id);
  }
}
