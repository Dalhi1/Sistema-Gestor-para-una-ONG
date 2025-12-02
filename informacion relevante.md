## 🛠️ Tecnologías Utilizadas

### Frontend (CAPA 1)
- **React** 18 - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **ShadCN UI** - Componentes reutilizables
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

### Backend (CAPA 2)
- **API Client Custom** - Interfaz de comunicación
- **Fallback System** - Sistema de respaldo
- **Supabase Edge Functions** - Backend serverless 
- **Deno** - Runtime para Edge Functions

### Persistencia (CAPA 3)
- **localStorage** - Almacenamiento local 
- **Supabase PostgreSQL** - Base de datos 
- **KV Store** - Sistema clave-valor

---

Desarrollado con:
- React + TypeScript
- Tailwind CSS
- ShadCN UI Components
- Supabase (infraestructura)

## 🛠️ Tecnologías por Capa

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Supabase Edge Functions (Deno), API REST, TypeScript |
| **Servidor** | PostgreSQL, Supabase KV Store, localStorage API |

---

## 🔐 Seguridad por Capas

### Capa 1 (Frontend)
- Validación de formularios en cliente
- Sanitización de inputs
- Protección contra XSS

### Capa 2 (Backend)
- Autenticación con credenciales
- Validación de permisos por rol
- Rate limiting en Edge Functions
- Sanitización de datos

### Capa 3 (Servidor)
- Hashing de contraseñas (bcrypt)
- Transacciones ACID
- Backups automáticos
- Encriptación en tránsito (HTTPS)

---

#### Componentes Principales

| Archivo | Descripción |
|---------|-------------|
| `/App.tsx` | Controlador principal, gestión de estado global y navegación |
| `/components/LoginScreen.tsx` | Pantalla de autenticación |
| `/components/RegisterScreen.tsx` | Registro de usuarios con validaciones |
| `/components/CoordinatorPanel.tsx` | Panel de gestión para coordinadores |
| `/components/EmployeePanel.tsx` | Panel de trabajo para empleados |
| `/components/ProjectDetail.tsx` | Vista detallada de proyectos con fases |
| `/components/ProjectChat.tsx` | Sistema de chat empleado-usuario |
| `/components/RequestForm.tsx` | Formulario de solicitudes benéficas |
| `/components/ui/*` | Componentes reutilizables (ShadCN) |


## 📊 Representación Visual Detallada de la arquitectura del sistema

```
╔═══════════════════════════════════════════════════════════════════════╗
║                          NAVEGADOR (CLIENTE)                          ║
╚═══════════════════════════════════════════════════════════════════════╝
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ╔══════════════════════════════════════════════════════════╗      │
│   ║                   CAPA 1: FRONTEND                       ║      │
│   ║                 (Presentación / UI Layer)                ║      │
│   ╠══════════════════════════════════════════════════════════╣      │
│   ║                                                          ║      │
│   ║     /App.tsx (Controlador principal)                     ║      │
│   ║      └─ Gestión de estado (useState, useEffect)          ║      │
│   ║      └─ Navegación entre vistas                          ║      │
│   ║      └─ Autenticación y roles                            ║      │
│   ║                                                          ║      │
│   ║    /components/                                          ║      │
│   ║      ├─ LoginScreen.tsx (Pantalla de login)              ║      │
│   ║      ├─ RegisterScreen.tsx (Registro de usuarios)        ║      │
│   ║      ├─ CoordinatorPanel.tsx (Panel coordinador)         ║      │
│   ║      ├─ EmployeePanel.tsx (Panel empleados)              ║      │
│   ║      ├─ ProjectDetail.tsx (Detalle de proyectos)         ║      │
│   ║      ├─ ProjectChat.tsx (Sistema de chat)                ║      │
│   ║      ├─ RequestForm.tsx (Formulario solicitudes)         ║      │
│   ║      └─ ui/* (Componentes ShadCN reutilizables)          ║      │
│   ║                                                          ║      │
│   ║    Tecnologías:                                          ║      │
│   ║      • React (UI Library)                                ║      │
│   ║      • TypeScript (Type Safety)                          ║      │
│   ║      • Tailwind CSS (Styling)                            ║      │
│   ║      • Lucide React (Icons)                              ║      │
│   ║                                                          ║      │
│   ╚══════════════════════════════════════════════════════════╝      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                            API CALLS (HTTPS)
                                    ↓
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   ╔═════════════════════════════════════════════════════════╗      │
│   ║                    CAPA 2: BACKEND                      ║      │
│   ║              (Lógica de Negocio / Business Logic)       ║      │
│   ╠═════════════════════════════════════════════════════════╣      │
│   ║                                                         ║      │
│   ║    /utils/supabase/client.tsx (API Client Layer)        ║      │
│   ║     ┌─────────────────────────────────────────────┐     ║      │
│   ║     │  authAPI (Autenticación)                    │     ║      │
│   ║     │   ├─ register()  → Registrar usuario        │     ║      │
│   ║     │   ├─ login()     → Iniciar sesión           │     ║      │
│   ║     │   └─ deleteUser()→ Eliminar usuario         │     ║      │
│   ║     │                                             │     ║      │
│   ║     │  requestAPI (Solicitudes)                   │     ║      │
│   ║     │   ├─ getAll()   → Obtener solicitudes       │     ║      │
│   ║     │   ├─ create()   → Crear solicitud           │     ║      │
│   ║     │   ├─ approve()  → Aprobar solicitud         │     ║      │
│   ║     │   └─ reject()   → Rechazar solicitud        │     ║      │
│   ║     │                                             │     ║      │
│   ║     │  projectAPI (Proyectos)                     │     ║      │
│   ║     │   ├─ getAll()      → Obtener proyectos      │     ║      │
│   ║     │   ├─ uploadFile()  → Subir archivo          │     ║      │
│   ║     │   ├─ approvePhase()→ Aprobar fase           │     ║      │
│   ║     │   ├─ returnPhase() → Devolver fase          │     ║      │
│   ║     │   └─ complete()    → Completar proyecto     │     ║      │
│   ║     │                                             │     ║      │
│   ║     │  chatAPI (Mensajería)                       │     ║      │
│   ║     │   ├─ getMessages()  → Obtener mensajes      │     ║      │
│   ║     │   └─ sendMessage()  → Enviar mensaje        │     ║      │
│   ║     │                                             │     ║      │
│   ║     │  dataAPI (Consultas BD)                     │     ║      │
│   ║     │   └─ getAll() → Obtener todos los datos     │     ║      │
│   ║     └─────────────────────────────────────────────┘     ║      │
│   ║                            ↓                            ║      │
│   ║                   ┌────────┴────────┐                   ║      │
│   ║                   ↓                 ↓                   ║      │
│   ║     ┌──────────────────┐  ┌──────────────────┐          ║      │
│   ║     │  Supabase Edge   │  │  Fallback Logic  │          ║      │
│   ║     │    Functions     │  │  (localStorage)  │          ║      │
│   ║     │  (Serverless)    │  │                  │          ║      │
│   ║     └──────────────────┘  └──────────────────┘          ║      │
│   ║                                                         ║      │
│   ║      /supabase/functions/server/index.tsx               ║      │
│   ║     └─ Edge Functions (Backend serverless en Deno)      ║      │
│   ║        ├─ POST /auth/register                           ║      │
│   ║        ├─ POST /auth/login                              ║      │
│   ║        ├─ GET  /requests                                ║      │
│   ║        ├─ POST /requests                                ║      │
│   ║        ├─ POST /requests/:id/approve                    ║      │
│   ║        ├─ GET  /projects                                ║      │
│   ║        ├─ POST /projects/:id/phases/:phaseId/files      ║      │
│   ║        ├─ POST /projects/:id/phases/:phaseId/approve    ║      │
│   ║        ├─ POST /projects/:id/complete                   ║      │
│   ║        ├─ GET  /projects/:id/chat                       ║      │
│   ║        ├─ POST /projects/:id/chat                       ║      │
│   ║        └─ GET  /data/all                                ║      │
│   ║                                                         ║      │
│   ║     /utils/supabase/fallback.tsx                        ║      │
│   ║     └─ Sistema de respaldo con localStorage             ║      │
│   ║        └─ Replica funcionalidad de Supabase             ║      │
│   ║                                                         ║      │
│   ║    Responsabilidades:                                   ║      │
│   ║      • Validación de datos                              ║      │
│   ║      • Autenticación de usuarios                        ║      │
│   ║      • Autorización por roles                           ║      │
│   ║      • Aplicación de reglas de negocio                  ║      │
│   ║      • Transformación de datos                          ║      │
│   ║      • Manejo de errores                                ║      │
│   ║                                                         ║      │
│   ╚═════════════════════════════════════════════════════════╝      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                    ↓
                          DATABASE QUERIES (SQL)
                                    ↓
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ╔═══════════════════════════════════════════════════════════╗      │
│   ║                    CAPA 3: SERVIDOR                       ║      │
│   ║              (Persistencia / Data Persistence)            ║      │
│   ╠═══════════════════════════════════════════════════════════╣      │
│   ║                                                           ║      │
│   ║    Supabase PostgreSQL Database                           ║      │
│   ║     ┌─────────────────────────────────────────────┐       ║      │
│   ║     │  Tabla: kv_store_01ad82bb                   │       ║      │
│   ║     │  ┌──────────┬──────────┐                    │       ║      │
│   ║     │  │   key    │  value   │                    │       ║      │
│   ║     │  │  (TEXT)  │ (JSONB)  │                    │       ║      │
│   ║     │  └──────────┴──────────┘                    │       ║      │
│   ║     │                                             │       ║      │
│   ║     │  Estructura de keys:                        │       ║      │
│   ║     │  • user:{username}        → Usuarios        │       ║      │
│   ║     │  • request:{id}           → Solicitudes     │       ║      │
│   ║     │  • project:{id}           → Proyectos       │       ║      │
│   ║     │  • chat:{projectId}:{id}  → Mensajes        │       ║      │
│   ║     └─────────────────────────────────────────────┘       ║      │
│   ║                                                           ║      │
│   ║     /supabase/functions/server/kv_store.tsx               ║      │
│   ║     └─ Capa de abstracción sobre PostgreSQL               ║      │
│   ║        ├─ set(key, value)     → Guardar dato              ║      │
│   ║        ├─ get(key)            → Obtener dato              ║      │
│   ║        ├─ del(key)            → Eliminar dato             ║      │
│   ║        ├─ mset(keys, values)  → Guardar múltiple          ║      │
│   ║        ├─ mget(keys)          → Obtener múltiple          ║      │
│   ║        └─ getByPrefix(prefix) → Buscar por prefijo        ║      │
│   ║                                                           ║      │
│   ║      Fallback: localStorage (Navegador)                   ║      │
│   ║     ┌─────────────────────────────────────────────┐       ║      │
│   ║     │  Keys:                                      │       ║      │
│   ║     │  • charity_homework_users     → Usuarios    │       ║      │
│   ║     │  • charity_homework_requests  → Solicitudes │       ║      │
│   ║     │  • charity_homework_projects  → Proyectos   │       ║      │
│   ║     │  • charity_homework_chat      → Mensajes    │       ║      │
│   ║     └─────────────────────────────────────────────┘       ║      │
│   ║                                                           ║      │
│   ║    Responsabilidades:                                     ║      │
│   ║      • Almacenamiento persistente de datos                ║      │
│   ║      • Garantizar integridad transaccional                ║      │
│   ║      • Indexación para búsquedas rápidas                  ║      │
│   ║      • Backup y recuperación de datos                     ║      │
│   ║      • Control de concurrencia                            ║      │
│   ║                                                           ║      │
│   ╚═══════════════════════════════════════════════════════════╝      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---
