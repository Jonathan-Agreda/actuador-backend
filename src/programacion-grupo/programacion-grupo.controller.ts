import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProgramacionGrupoService } from './programacion-grupo.service';
import { CreateProgramacionGrupoDto } from './dto/create-programacion-grupo.dto';

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
}
