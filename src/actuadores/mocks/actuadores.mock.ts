export const actuadoresMock = [
  {
    id: '1',
    alias: 'Lora A1',
    ip: '192.168.0.104',
    latitud: -2.153,
    longitud: -79.9001,
    estado: 'offline', // "online"
    relayEncendido: false,
    gateway: {
      ip: '192.168.0.1',
      estado: 'ok', // "reiniciando", "caido"
    },
  },
  {
    id: '2',
    alias: 'Lora B2',
    ip: '192.168.0.100',
    latitud: -2.155,
    longitud: -79.9004,
    estado: 'offline',
    relayEncendido: true,
    gateway: {
      ip: '192.168.0.101',
      estado: 'ok',
    },
  },
  {
    id: '3',
    alias: 'Lora C3',
    ip: '192.168.0.100',
    latitud: -2.155,
    longitud: -79.9004,
    estado: 'offline',
    relayEncendido: true,
    gateway: {
      ip: '192.168.1.101',
      estado: 'ok',
    },
  },
];
