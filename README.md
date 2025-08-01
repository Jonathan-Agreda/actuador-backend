# ⚙️ Actuador Backend

API REST + WebSocket para el sistema de gestión de actuadores centralizados. Desarrollado con NestJS, Prisma y PostgreSQL. Este backend permite controlar remotamente actuadores Lora, gestionar grupos, programar tareas y emitir actualizaciones en tiempo real al frontend.

---

## 🚀 Tecnologías utilizadas

- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [WebSocket Gateway (NestJS)](https://docs.nestjs.com/websockets/gateways)
- [Class Validator / Transformer](https://docs.nestjs.com/techniques/validation)
- [Dotenv](https://github.com/motdotla/dotenv) – configuración por entorno

---

## ⚙️ Instalación local

```bash
git clone https://github.com/tu-usuario/actuador-backend.git
cd actuador-backend
npm install
```

---

## 🛠️ Scripts útiles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Test de cobertura (opcional)
npm run test:cov
```

---

## 🧩 Estructura del proyecto

```
/src
├── actuadores/          # Módulo principal: Lora + Gateway + Relés
├── grupos/              # Módulo para agrupación y acciones grupales
├── scheduler/           # Programación de tareas
├── websocket/           # WebSocket Gateway
├── data/                # Prisma Service + conexión DB
├── common/              # DTOs, pipes, decoradores reutilizables
```

---

## 🗃️ Variables de entorno necesarias

```env
DATABASE_URL=postgresql://usuario:clave@localhost:5432/actuadores
PORT=4000
API_KEY_SECRET=clave_secreta_para_loras
MONITOR_INTERVAL_MS=10000
```

---

## 🔌 Conexión con frontend

Este backend expone rutas tipo REST y envía actualizaciones por WebSocket. Compatible con:  
👉 [`actuador-frontend`](https://github.com/tu-usuario/actuador-frontend)

---

## 📦 Funcionalidades

- ✅ Registro y actualización de actuadores vía API
- 📡 Recepción de reportes por HTTP desde Lora
- ⚡ Control de relés (motor, válvula, reinicio de gateway)
- 🧠 Programación de encendido/apagado por grupo
- 🔒 Autenticación de dispositivos con API Key
- 🔔 Emisión de eventos en tiempo real vía WebSocket

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT.
