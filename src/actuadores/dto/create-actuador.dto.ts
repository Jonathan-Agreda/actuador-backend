// src/actuadores/dto/create-actuador.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIP,
  Min,
  Max,
} from 'class-validator';

export class CreateActuadorDto {
  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @IsIP(4, { message: 'La IP debe ser una dirección IPv4 válida' })
  ip: string;

  @IsOptional()
  @IsString()
  gatewayId?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;
}
