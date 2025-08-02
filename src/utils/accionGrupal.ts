import { PrismaService } from '../data/prisma.service';

export async function ejecutarAccionGrupal(
  prisma: PrismaService,
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
    const url =
      accion === 'encender'
        ? `http://${actuador.ip}/encender-motor`
        : `http://${actuador.ip}/apagar-motor`;

    try {
      await fetch(url, { method: 'POST' });
      console.log(`✅ ${accion} ${actuador.alias}`);
    } catch (error) {
      console.error(`❌ Error con ${actuador.alias}:`, error.message);
    }
  }
}
