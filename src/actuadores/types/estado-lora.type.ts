import type { Relays } from './relays.type';

export interface EstadoLoraPayload {
  ip?: string; // IPv4 del Lora (opcional)
  estado?: 'online' | 'offline'; // opcional
  estadoGateway: 'ok' | 'reiniciando' | 'caido';
  relays: Relays;
  motorEncendido: boolean;
  gatewayAlias?: string; // opcional (solo para el WS/frontend)
  gatewayIp?: string; // opcional (solo para el WS/frontend)
  timestamp?: string | number; // ISO o epoch(ms) (opcional)
}
