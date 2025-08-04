// test-mqtt-publish.js
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883'); // asegúrate de que EMQX o Mosquitto está corriendo

const payload = {
  relays: {
    releGateway: true,
    releValvula: false,
    releMotor1: false,
    releMotor2: false,
  },
  motorEncendido: false,
  estadoGateway: 'ok',
  gatewayAlias: 'GW1',
  gatewayIp: '192.168.0.1',
  ip: '192.168.0.104',
  estado: 'online',
  timestamp: new Date().toISOString(),
};

// apiKey que existe en tu base de datos
const apiKey = '000'; // cambia si usas otra

const topic = `actuadores/${apiKey}/estado`;

client.on('connect', () => {
  console.log('✅ Conectado al broker MQTT');

  client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
    if (err) {
      console.error('❌ Error al publicar:', err);
    } else {
      console.log(`📤 Mensaje publicado en topic "${topic}"`);
    }
    client.end();
  });
});
