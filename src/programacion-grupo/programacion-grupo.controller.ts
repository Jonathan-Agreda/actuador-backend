import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProgramacionGrupoService } from './programacion-grupo.service';
import { CreateProgramacionGrupoDto } from './dto/create-programacion-grupo.dto';
import { UpdateProgramacionDto } from './dto/update-programacion.dto';

@Controller('programacion-grupo')
export class ProgramacionGrupoController {
  constructor(
    private readonly programacionGrupoService: ProgramacionGrupoService,
  ) {}

  @Post()
  create(@Body() dto: CreateProgramacionGrupoDto) {
    return this.programacionGrupoService.create(dto);
  }

  @Get()
  findAll() {
    return this.programacionGrupoService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.programacionGrupoService.remove(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProgramacionDto) {
    return this.programacionGrupoService.update(id, dto);
  }
}
