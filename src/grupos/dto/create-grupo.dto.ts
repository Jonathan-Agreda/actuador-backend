// src/grupos/dto/create-grupo.dto.ts
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateGrupoDto {
  @IsString()
  nombre: string;

  @IsString()
  empresaId: string;

  @IsArray()
  @ArrayNotEmpty()
  loraIds: string[];
}
