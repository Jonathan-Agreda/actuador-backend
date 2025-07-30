import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  create(@Body() dto: CreateGrupoDto) {
    return this.gruposService.crearGrupo(dto);
  }

  @Get()
  findAll() {
    return this.gruposService.obtenerTodos();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.gruposService.eliminarGrupo(id);
  }
}
