// src/utils/accionGrupal.ts
import { MqttService } from '../mqtt/mqtt.service';
import { PrismaService } from '../data/prisma.service';

export async function ejecutarAccionGrupal(
  prisma: PrismaService,
  mqttService: MqttService,
  grupoId: string,
  accion: 'encender' | 'apagar',
) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      GrupoActuador: {
        include: {
          actuador: true,
        },
      },
    },
  });

  if (!grupo) return;

  for (const ga of grupo.GrupoActuador) {
    const actuador = ga.actuador;
    const topic = `actuadores/${actuador.apiKey}/comando`; // ✅ corregido
    const payload = { tipo: `${accion}-motor` }; // ✅ corregido

    try {
      await mqttService.publish(topic, payload);
      console.log(`✅ MQTT comando enviado: ${accion} ${actuador.alias}`);
    } catch (error: any) {
      console.error(
        `❌ Error al enviar MQTT a ${actuador.alias}:`,
        error.message,
      );
    }
  }
}
