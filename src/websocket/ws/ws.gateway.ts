import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway {
  @WebSocketServer()
  server: Server;

  // Este método se puede llamar desde cualquier servicio para emitir datos
  emitirEstadosActualizados(estados: any[]) {
    this.server.emit('estado-actuadores', estados);
  }
}
