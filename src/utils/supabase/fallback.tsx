const STORAGE_KEYS = {
  USERS: 'charity_homework_users',
  REQUESTS: 'charity_homework_requests',
  PROJECTS: 'charity_homework_projects',
  CHAT: 'charity_homework_chat',
  NOTIFICATIONS: 'charity_homework_notifications'
};

// Helpers para localStorage
const getFromStorage = (key: string, defaultValue: any = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Generar ID único
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Auth API Fallback
export const authAPIFallback = {
  register: async (userData: {
    fullName: string;
    age: number;
    gender: string;
    username: string;
    password: string;
  }) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    
    // Normalizar username a lowercase y trim
    const normalizedUsername = userData.username.toLowerCase().trim();
    const normalizedPassword = userData.password.trim();
    
    console.log('📝 Register attempt:', { 
      username: normalizedUsername, 
      fullName: userData.fullName,
      passwordLength: normalizedPassword.length
    });
    console.log('📦 Current users:', users.map((u: any) => u.username));
    
    // Verificar si el usuario ya existe
    const existingUser = users.find((u: any) => u.username.toLowerCase().trim() === normalizedUsername);
    if (existingUser) {
      console.log('❌ Registration failed - username already exists');
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    const newUser = {
      id: generateId(),
      fullName: userData.fullName,
      age: userData.age,
      gender: userData.gender,
      username: normalizedUsername,
      password: normalizedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    console.log('✅ User registered successfully:', {
      username: newUser.username,
      passwordLength: newUser.password.length
    });
    console.log('📦 Total users in storage:', users.length);
    console.log('📦 All usernames:', users.map((u: any) => u.username));
    
    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role
      }
    };
  },
  
  login: async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🔐 === LOGIN CON VALIDACIÓN ===');
    console.log('Username recibido:', username);
    console.log('Password recibido:', password ? '***' : 'vacío');
    
    // Normalizar credenciales
    const inputUsername = String(username).toLowerCase().trim();
    const inputPassword = String(password).trim();
    
    console.log('Username normalizado:', inputUsername);
    
    // USUARIOS PREDEFINIDOS (hardcoded)
    const predefinedUsers = [
      { username: 'admin', password: '1234', role: 'coordinator' as const, fullName: 'Coordinador Principal', id: 'admin' },
      { username: 'andrea', password: '1234', role: 'employee' as const, fullName: 'Andrea', id: 'andrea' },
      { username: 'luis', password: '1234', role: 'employee' as const, fullName: 'Luis', id: 'luis' },
      { username: 'sergio', password: '1234', role: 'employee' as const, fullName: 'Sergio', id: 'sergio' }
    ];
    
    // Verificar si es un usuario predefinido
    const predefinedUser = predefinedUsers.find(u => u.username === inputUsername);
    if (predefinedUser) {
      if (predefinedUser.password === inputPassword) {
        console.log('✅ Login exitoso - Usuario predefinido:', predefinedUser.username);
        return {
          success: true,
          user: {
            id: predefinedUser.id,
            username: predefinedUser.username,
            fullName: predefinedUser.fullName,
            role: predefinedUser.role
          }
        };
      } else {
        console.log('❌ Login fallido - Contraseña incorrecta para usuario predefinido');
        throw new Error('Usuario o contraseña incorrectos');
      }
    }
    
    // Verificar en usuarios registrados en localStorage
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    console.log('📦 Usuarios registrados en localStorage:', users.length);
    console.log('📦 Usernames disponibles:', users.map((u: any) => u.username));
    
    const registeredUser = users.find((u: any) => 
      u.username.toLowerCase().trim() === inputUsername
    );
    
    if (!registeredUser) {
      console.log('❌ Login fallido - Usuario no encontrado');
      throw new Error('Usuario o contraseña incorrectos');
    }
    
    if (registeredUser.password !== inputPassword) {
      console.log('❌ Login fallido - Contraseña incorrecta');
      throw new Error('Usuario o contraseña incorrectos');
    }
    
    console.log('✅ Login exitoso - Usuario registrado:', registeredUser.username);
    
    return {
      success: true,
      user: {
        id: registeredUser.id,
        username: registeredUser.username,
        fullName: registeredUser.fullName,
        role: registeredUser.role
      }
    };
  },
  
  getAllUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage(STORAGE_KEYS.USERS, []);
  },
  
  deleteUser: async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🗑️ === ELIMINANDO USUARIO Y SUS PROYECTOS ===');
    console.log('Username a eliminar:', username);
    
    const normalizedUsername = username.toLowerCase().trim();
    
    // Eliminar el usuario
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const updatedUsers = users.filter((u: any) => u.username.toLowerCase().trim() !== normalizedUsername);
    saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
    
    console.log('✅ Usuario eliminado del storage');
    console.log('📊 Usuarios restantes:', updatedUsers.length);
    
    // Eliminar TODAS las solicitudes del usuario
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    const updatedRequests = requests.filter((r: any) => 
      r.requestedBy.toLowerCase().trim() !== normalizedUsername
    );
    saveToStorage(STORAGE_KEYS.REQUESTS, updatedRequests);
    
    const deletedRequestsCount = requests.length - updatedRequests.length;
    console.log(`✅ ${deletedRequestsCount} solicitud(es) del usuario eliminada(s)`);
    
    // Eliminar TODOS los proyectos del usuario
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const updatedProjects = projects.filter((p: any) => 
      p.requestedBy.toLowerCase().trim() !== normalizedUsername
    );
    saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
    
    const deletedProjectsCount = projects.length - updatedProjects.length;
    console.log(`✅ ${deletedProjectsCount} proyecto(s) del usuario eliminado(s)`);
    
    // Eliminar TODOS los mensajes de chat de los proyectos del usuario
    const chats = getFromStorage(STORAGE_KEYS.CHAT, []);
    const projectIdsToDelete = projects
      .filter((p: any) => p.requestedBy.toLowerCase().trim() === normalizedUsername)
      .map((p: any) => p.id);
    
    const updatedChats = chats.filter((c: any) => 
      !projectIdsToDelete.includes(c.projectId)
    );
    saveToStorage(STORAGE_KEYS.CHAT, updatedChats);
    
    const deletedChatsCount = chats.length - updatedChats.length;
    console.log(`✅ ${deletedChatsCount} mensaje(s) de chat eliminado(s)`);
    
    console.log('🎯 === ELIMINACIÓN COMPLETA ===');
    console.log('Resumen:', {
      usuario: normalizedUsername,
      solicitudesEliminadas: deletedRequestsCount,
      proyectosEliminados: deletedProjectsCount,
      mensajesEliminados: deletedChatsCount
    });
    
    return {
      success: true,
      deletedRequests: deletedRequestsCount,
      deletedProjects: deletedProjectsCount,
      deletedChats: deletedChatsCount
    };
  }
};

// Request API Fallback
export const requestAPIFallback = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    return requests;
  },
  
  create: async (requestData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    const newRequest = {
      id: generateId(),
      ...requestData,
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    saveToStorage(STORAGE_KEYS.REQUESTS, requests);
    
    return newRequest;
  },
  
  approve: async (requestId: string, employeeId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📋 Aprobando solicitud en fallback:', { requestId, employeeId });
    
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    console.log('📋 Solicitudes disponibles:', requests.map((r: any) => ({ id: r.id, title: r.title })));
    
    const request = requests.find((r: any) => r.id === requestId);
    
    if (!request) {
      console.error('❌ Solicitud NO encontrada. ID buscado:', requestId);
      console.error('❌ IDs disponibles:', requests.map((r: any) => r.id));
      throw new Error('Solicitud no encontrada');
    }
    
    console.log('✅ Solicitud encontrada:', request);
    
    // Crear proyecto a partir de la solicitud
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const newProject = {
      id: generateId(),
      title: request.title,
      description: request.description,
      category: request.category,
      requestedBy: request.requestedBy,
      status: 'approved',
      createdAt: request.createdAt,
      assignedEmployee: employeeId,
      phases: [
        {
          id: generateId(),
          name: 'Planificación',
          description: 'Fase de planificación del proyecto',
          files: [],
          status: 'pending'
        },
        {
          id: generateId(),
          name: 'Ejecución',
          description: 'Fase de ejecución del proyecto',
          files: [],
          status: 'pending'
        },
        {
          id: generateId(),
          name: 'Cierre',
          description: 'Fase de cierre del proyecto',
          files: [],
          status: 'pending'
        }
      ]
    };
    
    console.log('📦 Proyecto creado:', newProject);
    
    projects.push(newProject);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    // Eliminar solicitud
    const updatedRequests = requests.filter((r: any) => r.id !== requestId);
    saveToStorage(STORAGE_KEYS.REQUESTS, updatedRequests);
    
    console.log('✅ Solicitud aprobada y convertida en proyecto');
    
    return newProject;
  },
  
  reject: async (requestId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    const updatedRequests = requests.filter((r: any) => r.id !== requestId);
    saveToStorage(STORAGE_KEYS.REQUESTS, updatedRequests);
    
    return { success: true };
  }
};

// Project API Fallback
export const projectAPIFallback = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getFromStorage(STORAGE_KEYS.PROJECTS, []);
  },
  
  getOne: async (projectId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }
    
    return project;
  },
  
  uploadFile: async (projectId: string, phaseId: string, fileName: string, uploadedBy: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }
    
    const phase = project.phases.find((p: any) => p.id === phaseId);
    if (!phase) {
      throw new Error('Fase no encontrada');
    }
    
    const newFile = {
      id: generateId(),
      name: fileName,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      size: `${Math.floor(Math.random() * 900 + 100)} KB`
    };
    
    phase.files.push(newFile);
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return project;
  },
  
  approvePhase: async (projectId: string, phaseId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }
    
    const phase = project.phases.find((p: any) => p.id === phaseId);
    if (!phase) {
      throw new Error('Fase no encontrada');
    }
    
    phase.status = 'approved';
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return project;
  },
  
  returnPhase: async (projectId: string, phaseId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }
    
    const phase = project.phases.find((p: any) => p.id === phaseId);
    if (!phase) {
      throw new Error('Fase no encontrada');
    }
    
    phase.status = 'returned';
    phase.files = [];
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return project;
  },
  
  complete: async (projectId: string, completedBy: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🎯 FALLBACK complete project (marcando como completado):', { projectId, completedBy });
    
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find((p: any) => p.id === projectId);
    
    if (!project) {
      console.log('❌ Project not found:', projectId);
      throw new Error('Proyecto no encontrado');
    }
    
    console.log('📦 Project found, marking as completed:', project);
    
    // MARCAR el proyecto como completado (no eliminarlo)
    const updatedProject = {
      ...project,
      status: 'completed',
      completedBy,
      completedAt: new Date().toISOString()
    };
    
    const updatedProjects = projects.map((p: any) => 
      p.id === projectId ? updatedProject : p
    );
    saveToStorage(STORAGE_KEYS.PROJECTS, updatedProjects);
    
    console.log('✅ Proyecto marcado como completado en la BD');
    console.log('💾 Total de proyectos:', updatedProjects.length);
    
    // Retornar el proyecto completado
    return updatedProject;
  }
};

// Chat API Fallback
export const chatAPIFallback = {
  getMessages: async (projectId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allChats = getFromStorage(STORAGE_KEYS.CHAT, []);
    return allChats.filter((msg: any) => msg.projectId === projectId);
  },
  
  sendMessage: async (projectId: string, sender: string, senderRole: 'user' | 'employee', message: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const chats = getFromStorage(STORAGE_KEYS.CHAT, []);
    const newMessage = {
      id: generateId(),
      projectId,
      sender,
      senderRole,
      message,
      timestamp: new Date().toISOString()
    };
    
    chats.push(newMessage);
    saveToStorage(STORAGE_KEYS.CHAT, chats);
    
    return newMessage;
  }
};

// Notification API Fallback
export const notificationAPIFallback = {
  getAll: async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    // Filtrar notificaciones para el usuario actual y ordenar por fecha (más reciente primero)
    return notifications
      .filter((n: any) => n.recipientUsername === username)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  create: async (notificationData: {
    recipientUsername: string;
    type: 'file_uploaded' | 'phase_approved' | 'phase_returned';
    projectId: string;
    projectTitle: string;
    phaseName: string;
    message: string;
    metadata?: any;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    
    const newNotification = {
      id: generateId(),
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    console.log('🔔 Nueva notificación creada:', newNotification);
    
    return newNotification;
  },
  
  markAsRead: async (notificationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    const notification = notifications.find((n: any) => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
      console.log('✅ Notificación marcada como leída:', notificationId);
    }
    
    return notification;
  },
  
  markAllAsRead: async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    let count = 0;
    
    notifications.forEach((n: any) => {
      if (n.recipientUsername === username && !n.read) {
        n.read = true;
        count++;
      }
    });
    
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    console.log(`✅ ${count} notificaciones marcadas como leídas`);
    
    return { count };
  }
};

// Data API Fallback
export const dataAPIFallback = {
  getAll: async (prefix: string = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('📊 dataAPIFallback.getAll called with prefix:', prefix);
    
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const requests = getFromStorage(STORAGE_KEYS.REQUESTS, []);
    const projects = getFromStorage(STORAGE_KEYS.PROJECTS, []);
    const chat = getFromStorage(STORAGE_KEYS.CHAT, []);
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    
    console.log('📊 Data from localStorage:', {
      usersCount: users.length,
      requestsCount: requests.length,
      projectsCount: projects.length,
      chatCount: chat.length,
      notificationsCount: notifications.length
    });
    
    const result = {
      users,
      requests,
      projects,
      chat,
      notifications
    };
    
    console.log('📊 Returning data:', result);
    
    return result;
  }
};

// Función utilitaria para limpiar usuarios registrados
export const clearRegisteredUsers = () => {
  console.log('🧹 Limpiando TODOS los usuarios del localStorage...');
  
  try {
    // Leer usuarios actuales antes de borrar
    const currentUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    console.log('📊 Usuarios antes de eliminar:', currentUsers);
    
    // ELIMINAR completamente la clave de usuarios
    localStorage.removeItem(STORAGE_KEYS.USERS);
    
    // Verificar que se eliminó
    const afterDelete = localStorage.getItem(STORAGE_KEYS.USERS);
    console.log('📊 Usuarios después de eliminar:', afterDelete);
    
    if (afterDelete === null) {
      console.log('✅ Usuarios eliminados correctamente del localStorage');
      console.log('💡 La tabla de usuarios está ahora vacía');
      return true;
    } else {
      console.error('❌ Los usuarios NO se eliminaron correctamente');
      return false;
    }
  } catch (error) {
    console.error('❌ Error limpiando usuarios:', error);
    return false;
  }
};