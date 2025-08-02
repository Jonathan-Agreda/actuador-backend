import {
  IsString,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateProgramacionGrupoDto {
  @IsString()
  @IsNotEmpty()
  grupoId: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string; // formato: "HH:mm"

  @IsString()
  @IsNotEmpty()
  horaFin: string; // formato: "HH:mm"

  @IsString()
  @IsIn(['una_vez', 'diario', 'dias_especificos'])
  frecuencia: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  dias?: string[]; // solo si frecuencia === 'dias_especificos'

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
