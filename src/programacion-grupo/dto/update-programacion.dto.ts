import { IsBoolean } from 'class-validator';

export class UpdateProgramacionDto {
  @IsBoolean()
  activo: boolean;
}
