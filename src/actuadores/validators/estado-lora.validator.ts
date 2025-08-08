import { EstadoLoraPayload } from '../types/estado-lora.type';

export function isValidEstadoPayload(p: any): p is EstadoLoraPayload {
  if (!p || typeof p !== 'object') return false;

  // estadoGateway: requerido y controlado
  if (!['ok', 'reiniciando', 'caido'].includes(p.estadoGateway)) return false;

  // relays: requerido con booleans
  const r = p.relays;
  if (
    !r ||
    typeof r !== 'object' ||
    typeof r.releGateway !== 'boolean' ||
    typeof r.releValvula !== 'boolean' ||
    typeof r.releMotor1 !== 'boolean' ||
    typeof r.releMotor2 !== 'boolean'
  )
    return false;

  // motorEncendido: requerido boolean
  if (typeof p.motorEncendido !== 'boolean') return false;

  // estado: opcional pero controlado
  if (p.estado && !['online', 'offline'].includes(p.estado)) return false;

  // ip/gatewayAlias/gatewayIp/timestamp son opcionales
  return true;
}

/** Normaliza valores por defecto y parsea timestamp (útil antes de persistir) */
export function normalizeEstadoPayload(p: EstadoLoraPayload) {
  const ts =
    p.timestamp != null
      ? typeof p.timestamp === 'number'
        ? p.timestamp
        : Date.parse(p.timestamp)
      : Date.now();

  return {
    ip: p.ip,
    estado: p.estado ?? 'online',
    estadoGateway: p.estadoGateway,
    relays: p.relays,
    motorEncendido: p.motorEncendido,
    gatewayAlias: p.gatewayAlias,
    gatewayIp: p.gatewayIp,
    timestamp: ts, // epoch(ms)
  };
}
