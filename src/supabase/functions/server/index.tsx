import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// CAPA 3: Crear cliente Supabase para comunicación con base de datos
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-01ad82bb/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ENDPOINTS ==========

// Register endpoint - creates new user account
app.post("/make-server-01ad82bb/auth/register", async (c) => {
  try {
    const { fullName, age, gender, username, password } = await c.req.json();
    
    // Validate required fields
    if (!fullName || !age || !gender || !username || !password) {
      return c.json({ error: 'Todos los campos son requeridos' }, 400);
    }
    
    const lowerUsername = username.toLowerCase();
    
    // Check if username already exists
    const existingUser = await kv.get(`user:${lowerUsername}`);
    if (existingUser) {
      return c.json({ error: 'Este nombre de usuario ya está en uso' }, 400);
    }
    
    // Check if username is a reserved system account
    const reservedUsernames = ['admin', 'andrea', 'luis', 'sergio'];
    if (reservedUsernames.includes(lowerUsername)) {
      return c.json({ error: 'Este nombre de usuario está reservado' }, 400);
    }
    
    // Create new user
    const newUser = {
      username: lowerUsername,
      password, // En producción, esto debería ser hasheado
      fullName,
      age: parseInt(age),
      gender,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    await kv.set(`user:${lowerUsername}`, newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: `Error al registrar usuario: ${error}` }, 500);
  }
});

// Login endpoint - validates credentials
app.post("/make-server-01ad82bb/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Validate credentials
    const lowerUsername = username.toLowerCase();
    let role = null;
    let userData = null;
    
    // Check system accounts (admin and employees)
    if (username === 'admin' && password === '1234') {
      role = 'coordinator';
      userData = {
        username: 'admin',
        role,
        lastLogin: new Date().toISOString()
      };
    } else if ((lowerUsername === 'andrea' || lowerUsername === 'luis' || lowerUsername === 'sergio') && password === '1234') {
      role = 'employee';
      userData = {
        username: lowerUsername,
        role,
        lastLogin: new Date().toISOString()
      };
    } else {
      // Check registered users
      const user = await kv.get(`user:${lowerUsername}`);
      
      if (!user || user.password !== password) {
        return c.json({ error: 'Usuario o contraseña incorrectos' }, 401);
      }
      
      // Update last login
      userData = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      role = user.role;
    }
    
    if (!role) {
      return c.json({ error: 'Usuario o contraseña incorrectos' }, 401);
    }
    
    // Store or update user info
    await kv.set(`user:${userData.username}`, userData);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: `Error al iniciar sesión: ${error}` }, 500);
  }
});

// Delete user and all their projects/requests
app.delete("/make-server-01ad82bb/users/:username", async (c) => {
  try {
    const username = c.req.param('username');
    const lowerUsername = username.toLowerCase();
    
    console.log('🗑️ Deleting user and all their data:', lowerUsername);
    
    // Check if trying to delete a system account
    const reservedUsernames = ['admin', 'andrea', 'luis', 'sergio'];
    if (reservedUsernames.includes(lowerUsername)) {
      return c.json({ error: 'No se pueden eliminar usuarios del sistema' }, 400);
    }
    
    // Delete the user
    const user = await kv.get(`user:${lowerUsername}`);
    if (!user) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    await kv.del(`user:${lowerUsername}`);
    console.log('✅ User deleted from kv store');
    
    // Delete all requests from this user
    const allRequests = await kv.getByPrefix('request:');
    let deletedRequests = 0;
    for (const request of allRequests) {
      if (request.requestedBy.toLowerCase() === lowerUsername) {
        await kv.del(`request:${request.id}`);
        deletedRequests++;
      }
    }
    console.log(`✅ Deleted ${deletedRequests} request(s)`);
    
    // Delete all projects from this user
    const allProjects = await kv.getByPrefix('project:');
    let deletedProjects = 0;
    const deletedProjectIds: string[] = [];
    for (const project of allProjects) {
      if (project.requestedBy.toLowerCase() === lowerUsername) {
        await kv.del(`project:${project.id}`);
        deletedProjects++;
        deletedProjectIds.push(project.id);
      }
    }
    console.log(`✅ Deleted ${deletedProjects} project(s)`);
    
    // Delete all chat messages from user's projects
    let deletedChats = 0;
    for (const projectId of deletedProjectIds) {
      const projectChats = await kv.getByPrefix(`chat:${projectId}:`);
      for (const chat of projectChats) {
        await kv.del(`chat:${projectId}:${chat.id}`);
        deletedChats++;
      }
    }
    console.log(`✅ Deleted ${deletedChats} chat message(s)`);
    
    console.log('🎯 User deletion complete:', {
      username: lowerUsername,
      deletedRequests,
      deletedProjects,
      deletedChats
    });
    
    return c.json({ 
      success: true,
      deletedRequests,
      deletedProjects,
      deletedChats
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: `Error al eliminar usuario: ${error}` }, 500);
  }
});

// ========== REQUEST ENDPOINTS ==========

// Get all pending requests
app.get("/make-server-01ad82bb/requests", async (c) => {
  try {
    const requests = await kv.getByPrefix('request:');
    return c.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return c.json({ error: `Error al obtener solicitudes: ${error}` }, 500);
  }
});

// Create new request
app.post("/make-server-01ad82bb/requests", async (c) => {
  try {
    const requestData = await c.req.json();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    const newRequest = {
      ...requestData,
      id: requestId,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`request:${requestId}`, newRequest);
    
    return c.json({ request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    return c.json({ error: `Error al crear solicitud: ${error}` }, 500);
  }
});

// Approve request and convert to project
app.post("/make-server-01ad82bb/requests/:id/approve", async (c) => {
  try {
    const requestId = c.req.param('id');
    const { employeeId } = await c.req.json();
    
    const request = await kv.get(`request:${requestId}`);
    
    if (!request) {
      return c.json({ error: 'Solicitud no encontrada' }, 404);
    }
    
    // Create project from request
    const projectId = Math.random().toString(36).substr(2, 9);
    const newProject = {
      id: projectId,
      title: request.title,
      description: request.description,
      category: request.category,
      requestedBy: request.requestedBy,
      status: 'approved',
      createdAt: request.createdAt,
      assignedEmployee: employeeId,
      phases: [
        {
          id: 'phase-1',
          name: 'Fase 1: Planificación',
          description: 'Documentos de planificación, presupuestos y organización inicial del proyecto',
          files: [],
          status: 'pending',
        },
        {
          id: 'phase-2',
          name: 'Fase 2: Ejecución',
          description: 'Material de implementación, fotos del progreso y evidencias de actividades',
          files: [],
          status: 'pending',
        },
        {
          id: 'phase-3',
          name: 'Fase 3: Cierre',
          description: 'Resultados finales, reportes de impacto y documentación de cierre',
          files: [],
          status: 'pending',
        },
      ]
    };
    
    await kv.set(`project:${projectId}`, newProject);
    await kv.del(`request:${requestId}`);
    
    return c.json({ project: newProject });
  } catch (error) {
    console.error('Error approving request:', error);
    return c.json({ error: `Error al aprobar solicitud: ${error}` }, 500);
  }
});

// Reject request
app.delete("/make-server-01ad82bb/requests/:id", async (c) => {
  try {
    const requestId = c.req.param('id');
    await kv.del(`request:${requestId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return c.json({ error: `Error al rechazar solicitud: ${error}` }, 500);
  }
});

// ========== PROJECT ENDPOINTS ==========

// Get all projects
app.get("/make-server-01ad82bb/projects", async (c) => {
  try {
    const projects = await kv.getByPrefix('project:');
    return c.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: `Error al obtener proyectos: ${error}` }, 500);
  }
});

// Get single project
app.get("/make-server-01ad82bb/projects/:id", async (c) => {
  try {
    const projectId = c.req.param('id');
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }
    
    return c.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: `Error al obtener proyecto: ${error}` }, 500);
  }
});

// Upload file to phase
app.post("/make-server-01ad82bb/projects/:id/phases/:phaseId/files", async (c) => {
  try {
    const projectId = c.req.param('id');
    const phaseId = c.req.param('phaseId');
    const { fileName, uploadedBy } = await c.req.json();
    
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }
    
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile = {
      id: fileId,
      name: fileName,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      size: '1.2 MB'
    };
    
    // Update project phases
    const updatedPhases = project.phases.map((phase: any) => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          files: [...phase.files, newFile]
        };
      }
      return phase;
    });
    
    const updatedProject = {
      ...project,
      phases: updatedPhases
    };
    
    await kv.set(`project:${projectId}`, updatedProject);
    
    return c.json({ project: updatedProject, file: newFile });
  } catch (error) {
    console.error('Error uploading file:', error);
    return c.json({ error: `Error al subir archivo: ${error}` }, 500);
  }
});

// Approve phase
app.post("/make-server-01ad82bb/projects/:id/phases/:phaseId/approve", async (c) => {
  try {
    const projectId = c.req.param('id');
    const phaseId = c.req.param('phaseId');
    
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }
    
    // Update phase status
    const updatedPhases = project.phases.map((phase: any) => {
      if (phase.id === phaseId) {
        return { ...phase, status: 'approved' };
      }
      return phase;
    });
    
    const updatedProject = {
      ...project,
      phases: updatedPhases
    };
    
    await kv.set(`project:${projectId}`, updatedProject);
    
    return c.json({ project: updatedProject });
  } catch (error) {
    console.error('Error approving phase:', error);
    return c.json({ error: `Error al aprobar fase: ${error}` }, 500);
  }
});

// Return phase (reject)
app.post("/make-server-01ad82bb/projects/:id/phases/:phaseId/return", async (c) => {
  try {
    const projectId = c.req.param('id');
    const phaseId = c.req.param('phaseId');
    
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }
    
    // Update phase status and clear files
    const updatedPhases = project.phases.map((phase: any) => {
      if (phase.id === phaseId) {
        return { ...phase, status: 'returned', files: [] };
      }
      return phase;
    });
    
    const updatedProject = {
      ...project,
      phases: updatedPhases
    };
    
    await kv.set(`project:${projectId}`, updatedProject);
    
    return c.json({ project: updatedProject });
  } catch (error) {
    console.error('Error returning phase:', error);
    return c.json({ error: `Error al devolver fase: ${error}` }, 500);
  }
});

// Complete project (DELETES the project)
app.post("/make-server-01ad82bb/projects/:id/complete", async (c) => {
  try {
    const projectId = c.req.param('id');
    const { completedBy } = await c.req.json();
    
    console.log('🎯 COMPLETING project (marking as completed):', { projectId, completedBy });
    
    const project = await kv.get(`project:${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Proyecto no encontrado' }, 404);
    }
    
    console.log('📦 Project found, marking as completed:', project);
    
    // MARCAR el proyecto como completado (no eliminarlo)
    const updatedProject = {
      ...project,
      status: 'completed',
      completedBy,
      completedAt: new Date().toISOString()
    };
    
    // Guardar el proyecto actualizado
    await kv.set(`project:${projectId}`, updatedProject);
    
    console.log('✅ Project marked as completed in database');
    console.log('🎯 Project completion complete');
    
    // Return the updated project
    return c.json({ 
      project: updatedProject
    });
  } catch (error) {
    console.error('Error completing project:', error);
    return c.json({ error: `Error al completar proyecto: ${error}` }, 500);
  }
});

// ========== CHAT ENDPOINTS ==========

// Get chat messages for a project
app.get("/make-server-01ad82bb/projects/:id/chat", async (c) => {
  try {
    const projectId = c.req.param('id');
    const messages = await kv.getByPrefix(`chat:${projectId}:`);
    
    // Sort messages by timestamp
    const sortedMessages = (messages || []).sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return c.json({ error: `Error al obtener mensajes: ${error}` }, 500);
  }
});

// Send chat message
app.post("/make-server-01ad82bb/projects/:id/chat", async (c) => {
  try {
    const projectId = c.req.param('id');
    const { sender, senderRole, message } = await c.req.json();
    
    const messageId = Math.random().toString(36).substr(2, 9);
    const newMessage = {
      id: messageId,
      projectId,
      sender,
      senderRole,
      message,
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`chat:${projectId}:${messageId}`, newMessage);
    
    return c.json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: `Error al enviar mensaje: ${error}` }, 500);
  }
});

// ========== DATA VIEWER ENDPOINTS ==========

// Get all data organized by type (for debugging/admin panel)
app.get("/make-server-01ad82bb/data/all", async (c) => {
  try {
    console.log('📊 Fetching all data from KV store...');
    
    // Get all data by prefix
    const users = await kv.getByPrefix('user:');
    const requests = await kv.getByPrefix('request:');
    const projects = await kv.getByPrefix('project:');
    
    // Get all chat messages
    const allChatMessages: any[] = [];
    for (const project of projects) {
      const projectChats = await kv.getByPrefix(`chat:${project.id}:`);
      allChatMessages.push(...projectChats);
    }
    
    console.log('📊 Data counts:', {
      users: users.length,
      requests: requests.length,
      projects: projects.length,
      chat: allChatMessages.length
    });
    
    return c.json({
      users: users || [],
      requests: requests || [],
      projects: projects || [],
      chat: allChatMessages || []
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    return c.json({ error: `Error al obtener datos: ${error}` }, 500);
  }
});

Deno.serve(app.fetch);