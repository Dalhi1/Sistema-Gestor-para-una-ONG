import { projectId, publicAnonKey } from './info';
import { 
  authAPIFallback, 
  requestAPIFallback, 
  projectAPIFallback, 
  chatAPIFallback, 
  notificationAPIFallback,
  dataAPIFallback 
} from './fallback';

//Este módulo define una capa intermedia (API wrapper) entre tu aplicación frontend y los servicios de Supabase Edge Functions, con fallback a almacenamiento local (localStorage) si Supabase no está disponible.

// CAPA 3: URL de comunicación con servidor Supabase
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-01ad82bb`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Flag para detectar si Supabase está disponible
let supabaseAvailable: boolean | null = null;

// Función para verificar si Supabase está disponible
const checkSupabaseAvailability = async (): Promise<boolean> => {
  if (supabaseAvailable !== null) {
    return supabaseAvailable;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers 
    });
    supabaseAvailable = response.ok;
  } catch {
    supabaseAvailable = false;
  }
  
  if (!supabaseAvailable) {
    console.warn('⚠️ Supabase Edge Functions no disponibles. Usando almacenamiento local.');
  }
  
  return supabaseAvailable;
};

// Auth API
export const authAPI = {
  register: async (userData: {
    fullName: string;
    age: number;
    gender: string;
    username: string;
    password: string;
  }) => {
    try {

      console.log('🔄 Registrando usuario en localStorage...');
      const fallbackResult = await authAPIFallback.register(userData);
      
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error registrando usuario:', error);
      throw error;
    }
  },
  
  login: async (username: string, password: string) => {
    // TEMPORALMENTE: Usar solo fallback para depurar
    console.log('🔄 USANDO SOLO FALLBACK PARA DEBUG');
    return await authAPIFallback.login(username, password);
      
  },
  
  getAllUsers: async () => {
    try {
      const isAvailable = await checkSupabaseAvailability();
      if (!isAvailable) {
        return await authAPIFallback.getAllUsers();
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/users`, { headers });
      
      if (response.status === 404) {
        return await authAPIFallback.getAllUsers();
      }
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      return data.users;
    } catch {
      return await authAPIFallback.getAllUsers();
    }
  },
  
  deleteUser: async (username: string) => {
    try {
      // Intentar primero con fallback (localStorage)
      console.log('🔄 Eliminando usuario con fallback:', username);
      const fallbackResult = await authAPIFallback.deleteUser(username);
      
      // Intentar también con Supabase si está disponible
      try {
        console.log('🔄 Intentando también con Supabase...');
        const response = await fetch(`${API_BASE_URL}/users/${username}`, {
          method: 'DELETE',
          headers
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Usuario eliminado de Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo eliminar de Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }
};

// Request API
export const requestAPI = {
  getAll: async () => {
    // TEMPORALMENTE: Usar solo fallback para depurar
    console.log('🔄 Obteniendo solicitudes con fallback');
    return await requestAPIFallback.getAll();
    
  },
  
  create: async (requestData: any) => {
    try {
      // Crear primero en fallback (localStorage)
      console.log('🔄 Creando solicitud con fallback (localStorage):', requestData);
      const fallbackResult = await requestAPIFallback.create(requestData);
      
      // Intentar crear también en Supabase
      try {
        console.log('🔄 Intentando crear también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Solicitud creada en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo crear en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error creando solicitud:', error);
      throw error;
    }
  },
  
  approve: async (requestId: string, employeeId?: string) => {
    try {
      // Aprobar primero en fallback (localStorage)
      console.log('🔄 Aprobando solicitud con fallback (localStorage):', { requestId, employeeId });
      const fallbackResult = await requestAPIFallback.approve(requestId, employeeId);
      
      // Intentar aprobar también en Supabase
      try {
        console.log('🔄 Intentando aprobar también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ employeeId })
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Solicitud aprobada en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo aprobar en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error aprobando solicitud:', error);
      throw error;
    }
  },
  
  reject: async (requestId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.status === 404) {
        return await requestAPIFallback.reject(requestId);
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al rechazar solicitud');
      }
      
      return response.json();
    } catch (error: any) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return await requestAPIFallback.reject(requestId);
      }
      throw error;
    }
  }
};

// Project API
export const projectAPI = {
  getAll: async () => {
    // TEMPORALMENTE: Usar solo fallback para depurar
    console.log('🔄 Obteniendo proyectos con fallback');
    return await projectAPIFallback.getAll();
    
    
  },
  
  getOne: async (projectId: string) => {
    // TEMPORALMENTE: Usar solo fallback para depurar
    console.log('🔄 Obteniendo proyecto con fallback:', projectId);
    return await projectAPIFallback.getOne(projectId);
    
  },
  
  uploadFile: async (projectId: string, phaseId: string, fileName: string, uploadedBy: string) => {
    try {
      // Subir primero en fallback (localStorage)
      console.log('🔄 Subiendo archivo con fallback (localStorage)');
      const fallbackResult = await projectAPIFallback.uploadFile(projectId, phaseId, fileName, uploadedBy);
      
      // Intentar subir también en Supabase
      try {
        console.log('🔄 Intentando subir también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases/${phaseId}/files`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fileName, uploadedBy })
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Archivo subido en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo subir en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error subiendo archivo:', error);
      throw error;
    }
  },
  
  approvePhase: async (projectId: string, phaseId: string) => {
    try {
      // Aprobar primero en fallback (localStorage)
      console.log('🔄 Aprobando fase con fallback (localStorage)');
      const fallbackResult = await projectAPIFallback.approvePhase(projectId, phaseId);
      
      // Intentar aprobar también en Supabase
      try {
        console.log('🔄 Intentando aprobar también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases/${phaseId}/approve`, {
          method: 'POST',
          headers
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Fase aprobada en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo aprobar en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error aprobando fase:', error);
      throw error;
    }
  },
  
  returnPhase: async (projectId: string, phaseId: string) => {
    try {
      // Devolver primero en fallback (localStorage)
      console.log('🔄 Devolviendo fase con fallback (localStorage)');
      const fallbackResult = await projectAPIFallback.returnPhase(projectId, phaseId);
      
      // Intentar devolver también en Supabase
      try {
        console.log('🔄 Intentando devolver también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/phases/${phaseId}/return`, {
          method: 'POST',
          headers
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Fase devuelta en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo devolver en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error devolviendo fase:', error);
      throw error;
    }
  },
  
  complete: async (projectId: string, completedBy: string) => {
    try {
      // Completar primero con fallback (localStorage)
      console.log('🔄 Completando proyecto con fallback (eliminando de localStorage)');
      const fallbackResult = await projectAPIFallback.complete(projectId, completedBy);
      
      // Intentar también con Supabase si está disponible
      try {
        console.log('🔄 Intentando también con Supabase...');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/complete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ completedBy })
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Proyecto eliminado de Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo eliminar de Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error completando proyecto:', error);
      throw error;
    }
  }
};

// Chat API
export const chatAPI = {
  getMessages: async (projectId: string) => {
    // TEMPORALMENTE: Usar solo fallback para depurar
    console.log('🔄 Obteniendo mensajes con fallback');
    return await chatAPIFallback.getMessages(projectId);
    
  
  },
  
  sendMessage: async (projectId: string, sender: string, senderRole: 'user' | 'employee', message: string) => {
    try {
      // Enviar primero en fallback (localStorage)
      console.log('🔄 Enviando mensaje con fallback (localStorage)');
      const fallbackResult = await chatAPIFallback.sendMessage(projectId, sender, senderRole, message);
      
      // Intentar enviar también en Supabase
      try {
        console.log('🔄 Intentando enviar también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sender, senderRole, message })
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Mensaje enviado en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo enviar en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error);
      throw error;
    }
  }
};

// Notification API
export const notificationAPI = {
  getAll: async (username: string) => {
    console.log('🔄 Obteniendo notificaciones con fallback');
    return await notificationAPIFallback.getAll(username);
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
    try {
      console.log('🔄 Creando notificación con fallback (localStorage)');
      const fallbackResult = await notificationAPIFallback.create(notificationData);
      
      // Intentar crear también en Supabase
      try {
        console.log('🔄 Intentando crear también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify(notificationData)
        });
        
        if (response.ok) {
          const supabaseResult = await response.json();
          console.log('✅ Notificación creada en Supabase también:', supabaseResult);
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo crear en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      console.log('🔄 Marcando notificación como leída con fallback');
      const fallbackResult = await notificationAPIFallback.markAsRead(notificationId);
      
      // Intentar marcar también en Supabase
      try {
        console.log('🔄 Intentando marcar también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
          method: 'POST',
          headers
        });
        
        if (response.ok) {
          console.log('✅ Notificación marcada como leída en Supabase también');
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo marcar en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error marcando notificación:', error);
      throw error;
    }
  },
  
  markAllAsRead: async (username: string) => {
    try {
      console.log('🔄 Marcando todas las notificaciones como leídas con fallback');
      const fallbackResult = await notificationAPIFallback.markAllAsRead(username);
      
      // Intentar marcar también en Supabase
      try {
        console.log('🔄 Intentando marcar también en Supabase...');
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ username })
        });
        
        if (response.ok) {
          console.log('✅ Todas las notificaciones marcadas como leídas en Supabase también');
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudo marcar en Supabase (usando solo localStorage):', supabaseError);
      }
      
      return fallbackResult;
    } catch (error: any) {
      console.error('❌ Error marcando todas las notificaciones:', error);
      throw error;
    }
  }
};

// Data API (for database viewer)
export const dataAPI = {
  getAll: async (prefix: string = '') => {
    try {
      // Siempre obtener datos de localStorage primero
      console.log('🔄 Obteniendo datos de BD con fallback (localStorage)');
      const fallbackData = await dataAPIFallback.getAll(prefix);
      
      // Intentar también obtener de Supabase y mostrar en consola
      try {
        console.log('🔄 Intentando también obtener de Supabase...');
        const response = await fetch(`${API_BASE_URL}/data/all?prefix=${prefix}`, { 
          headers
        });
        
        if (response.ok) {
          const supabaseData = await response.json();
          console.log('📊 Datos de Supabase:', supabaseData);
          console.log('📊 Comparación:', {
            localStorage: {
              users: fallbackData.users.length,
              requests: fallbackData.requests.length,
              projects: fallbackData.projects.length,
              chat: fallbackData.chat.length,
              notifications: fallbackData.notifications.length
            },
            supabase: {
              users: supabaseData.users?.length || 0,
              requests: supabaseData.requests?.length || 0,
              projects: supabaseData.projects?.length || 0,
              chat: supabaseData.chat?.length || 0,
              notifications: supabaseData.notifications?.length || 0
            }
          });
        }
      } catch (supabaseError) {
        console.log('⚠️ No se pudieron obtener datos de Supabase:', supabaseError);
      }
      
      // Siempre retornar datos de localStorage
      return fallbackData;
    } catch (error: any) {
      console.error('❌ Error obteniendo datos:', error);
      throw error;
    }
  }
};