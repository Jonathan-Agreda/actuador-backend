import {
  IsString,
  IsIP,
  IsBoolean,
  IsObject,
  IsDateString,
} from 'class-validator';

export class ReporteEstadoDto {
  @IsString()
  apiKey: string;

  @IsIP()
  ip: string;

  @IsString()
  estado: 'online' | 'offline';

  @IsBoolean()
  gatewayOnline: boolean;

  @IsString()
  gatewayAlias: string;

  @IsIP()
  gatewayIp: string;

  @IsObject()
  reles: {
    releGateway: boolean;
    releValvula: boolean;
    releMotor1: boolean;
    releMotor2: boolean;
  };

  @IsBoolean()
  motorEncendido: boolean;

  @IsDateString()
  timestamp: string;
}
