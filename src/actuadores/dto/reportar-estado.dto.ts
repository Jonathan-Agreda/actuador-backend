import {
  IsBoolean,
  IsIn,
  IsIP,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Relays } from '../types/relays.type';

export class ReportarEstadoDto {
  @IsOptional()
  @IsIP(4)
  ip?: string;

  @IsOptional()
  @IsIn(['online', 'offline'])
  estado?: 'online' | 'offline';

  @IsIn(['ok', 'reiniciando', 'caido'])
  estadoGateway!: 'ok' | 'reiniciando' | 'caido';

  @IsObject()
  relays!: Relays;

  @IsBoolean()
  motorEncendido!: boolean;

  @IsOptional()
  @IsString()
  gatewayAlias?: string;

  @IsOptional()
  @IsString()
  gatewayIp?: string;

  @IsOptional()
  @IsString()
  timestamp?: string; // ISO
}
