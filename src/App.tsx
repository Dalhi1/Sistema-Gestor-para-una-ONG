import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RequestForm } from './components/RequestForm';
import { ProjectCards } from './components/ProjectCards';
import { CoordinatorPanel } from './components/CoordinatorPanel';
import { ProjectDetail } from './components/ProjectDetail';
import { EmployeePanel } from './components/EmployeePanel';
import { EmployeeProjectDetail } from './components/EmployeeProjectDetail';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { DataViewer } from './components/DataViewer';
import { SystemHealthCheck } from './components/SystemHealthCheck';

// CAPA 2: Importación de APIs de Backend
import { authAPI, requestAPI, projectAPI, chatAPI, notificationAPI } from './utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import type { Notification } from './components/NotificationPanel';

export interface ProjectFile {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date | string;
  size: string;
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  status: 'pending' | 'approved' | 'returned';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date | string;
  phases: Phase[];
  assignedEmployee?: string;
  completedBy?: string;
  completedAt?: Date | string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  requestedBy: string;
  createdAt: Date | string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  sender: string;
  senderRole: 'user' | 'employee';
  message: string;
  timestamp: Date | string;
}

export default function App() {
  // Estado de autenticación
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'user' | 'coordinator' | 'employee' | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Datos globales
  const [requests, setRequests] = useState<Request[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para mostrar el visor de datos
  const [showDataViewer, setShowDataViewer] = useState(false);
  const [showHealthCheck, setShowHealthCheck] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (currentUser && currentRole) {
      loadData();
    }
  }, [currentUser, currentRole]);

  // Cargar mensajes de chat cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject) {
      loadChatMessages(selectedProject.id);
    }
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, projectsData, notificationsData] = await Promise.all([
        requestAPI.getAll(),
        projectAPI.getAll(),
        currentUser ? notificationAPI.getAll(currentUser) : Promise.resolve([])
      ]);
      
      setRequests(requestsData);
      setProjects(projectsData);
      setNotifications(notificationsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (projectId: string) => {
    try {
      const messages = await chatAPI.getMessages(projectId);
      setChatMessages(messages);
    } catch (error: any) {
      console.error('Error loading chat messages:', error);
      toast.error('Error al cargar mensajes', {
        description: error.message
      });
    }
  };

  // Manejo de registro
  const handleRegister = async (userData: {
    fullName: string;
    age: number;
    gender: string;
    username: string;
    password: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Iniciar sesión automáticamente después del registro
      setCurrentUser(response.user.username);
      setCurrentRole(response.user.role);
      setShowRegister(false);
      
      toast.success('¡Cuenta creada exitosamente!', {
        description: 'Bienvenido a Charity Homework'
      });
    } catch (error: any) {
      throw error; // El componente RegisterScreen manejará el error
    }
  };

  // Manejo de login
  const handleLogin = (username: string, role: 'user' | 'coordinator' | 'employee') => {
    setCurrentUser(username);
    setCurrentRole(role);
    setShowRegister(false);
  };

  // Manejo de logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setSelectedProject(null);
    setRequests([]);
    setProjects([]);
    setChatMessages([]);
    setNotifications([]);
    setShowDataViewer(false);
  };

  // Verificar si el usuario actual ya tiene un proyecto aprobado
  const currentUserProject = currentUser ? projects.find((p) => p.requestedBy === currentUser && p.status !== 'completed') : undefined;
  const currentUserPendingRequest = currentUser ? requests.find((r) => r.requestedBy === currentUser) : undefined;
  const hasActiveProject = !!currentUserProject || !!currentUserPendingRequest;

  const handleNewRequest = async (request: Omit<Request, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const newRequest = await requestAPI.create(request);
      setRequests([...requests, newRequest]);
      toast.success('Solicitud creada', {
        description: 'Tu solicitud ha sido enviada para revisión'
      });
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error('Error al crear solicitud', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, employeeId?: string) => {
    try {
      setLoading(true);
      const newProject = await requestAPI.approve(requestId, employeeId);
      
      setProjects([...projects, newProject]);
      setRequests(requests.filter((r) => r.id !== requestId));
      
      toast.success('Solicitud aprobada', {
        description: `El proyecto ha sido asignado a ${employeeId}`
      });
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar solicitud', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoading(true);
      await requestAPI.reject(requestId);
      setRequests(requests.filter((r) => r.id !== requestId));
      toast.success('Solicitud rechazada');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar solicitud', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (projectId: string, phaseId: string, fileName: string) => {
    try {
      setLoading(true);
      const updatedProject = await projectAPI.uploadFile(projectId, phaseId, fileName, currentUser || 'Usuario');
      
      setProjects(projects.map((p) => p.id === projectId ? updatedProject : p));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }

      // Crear notificación para el empleado asignado
      if (updatedProject.assignedEmployee) {
        const phase = updatedProject.phases.find(p => p.id === phaseId);
        await notificationAPI.create({
          recipientUsername: updatedProject.assignedEmployee,
          type: 'file_uploaded',
          projectId: updatedProject.id,
          projectTitle: updatedProject.title,
          phaseName: phase?.name || 'Fase',
          message: `${currentUser} subió un archivo en ${phase?.name}`,
          metadata: {
            fileName,
            senderUsername: currentUser || 'Usuario'
          }
        });
        
        // Recargar notificaciones si el usuario actual es el empleado
        if (currentUser === updatedProject.assignedEmployee) {
          const updatedNotifications = await notificationAPI.getAll(currentUser);
          setNotifications(updatedNotifications);
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir archivo', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      const updatedProject = await projectAPI.complete(projectId, currentUser || '');
      
      setProjects(projects.map((p) => p.id === projectId ? updatedProject : p));
      setSelectedProject(null);
      
      toast.success('🎉 Proyecto completado', {
        description: 'El proyecto ha sido finalizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error completing project:', error);
      toast.error('Error al completar proyecto', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePhase = async (projectId: string, phaseId: string) => {
    try {
      setLoading(true);
      const updatedProject = await projectAPI.approvePhase(projectId, phaseId);
      
      setProjects(projects.map((p) => p.id === projectId ? updatedProject : p));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      // Crear notificación para el usuario del proyecto
      const phase = updatedProject.phases.find(p => p.id === phaseId);
      await notificationAPI.create({
        recipientUsername: updatedProject.requestedBy,
        type: 'phase_approved',
        projectId: updatedProject.id,
        projectTitle: updatedProject.title,
        phaseName: phase?.name || 'Fase',
        message: `Tu fase "${phase?.name}" ha sido aprobada`,
        metadata: {
          senderUsername: currentUser || 'Empleado'
        }
      });
      
      // Recargar notificaciones si el usuario actual es el dueño del proyecto
      if (currentUser === updatedProject.requestedBy) {
        const updatedNotifications = await notificationAPI.getAll(currentUser);
        setNotifications(updatedNotifications);
      }
      
      toast.success('Fase aprobada', {
        description: 'La fase ha sido revisada y aprobada'
      });
    } catch (error: any) {
      console.error('Error approving phase:', error);
      toast.error('Error al aprobar fase', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnPhase = async (projectId: string, phaseId: string) => {
    try {
      setLoading(true);
      const updatedProject = await projectAPI.returnPhase(projectId, phaseId);
      
      setProjects(projects.map((p) => p.id === projectId ? updatedProject : p));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      // Crear notificación para el usuario del proyecto
      const phase = updatedProject.phases.find(p => p.id === phaseId);
      await notificationAPI.create({
        recipientUsername: updatedProject.requestedBy,
        type: 'phase_returned',
        projectId: updatedProject.id,
        projectTitle: updatedProject.title,
        phaseName: phase?.name || 'Fase',
        message: `Tu fase "${phase?.name}" necesita correcciones`,
        metadata: {
          senderUsername: currentUser || 'Empleado'
        }
      });
      
      // Recargar notificaciones si el usuario actual es el dueño del proyecto
      if (currentUser === updatedProject.requestedBy) {
        const updatedNotifications = await notificationAPI.getAll(currentUser);
        setNotifications(updatedNotifications);
      }
      
      toast.warning('Documentos devueltos', {
        description: 'El usuario deberá volver a subir los archivos'
      });
    } catch (error: any) {
      console.error('Error returning phase:', error);
      toast.error('Error al devolver fase', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (projectId: string, message: string, senderRole: 'user' | 'employee') => {
    try {
      const newMessage = await chatAPI.sendMessage(projectId, currentUser || '', senderRole, message);
      setChatMessages([...chatMessages, newMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje', {
        description: error.message
      });
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      if (currentUser) {
        await notificationAPI.markAllAsRead(currentUser);
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar notificaciones', {
        description: error.message
      });
    }
  };

  // Si no hay usuario logueado, mostrar pantalla de login o registro
  if (!currentUser || !currentRole) {
    if (showRegister) {
      return (
        <RegisterScreen 
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        onShowDataViewer={currentRole === 'coordinator' ? () => setShowDataViewer(!showDataViewer) : undefined}
        showingDataViewer={showDataViewer}
        onShowHealthCheck={currentRole === 'coordinator' ? () => setShowHealthCheck(!showHealthCheck) : undefined}
        showingHealthCheck={showHealthCheck}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {loading && (
          <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Cargando...
          </div>
        )}
        
        {showDataViewer && currentRole === 'coordinator' ? (
          <DataViewer />
        ) : showHealthCheck && currentRole === 'coordinator' ? (
          <SystemHealthCheck />
        ) : selectedProject ? (
          currentRole === 'employee' ? (
            <EmployeeProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onApprovePhase={handleApprovePhase}
              onReturnPhase={handleReturnPhase}
              onCompleteProject={handleCompleteProject}
              currentUser={currentUser}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <ProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onUploadFile={handleUploadFile}
              onCompleteProject={handleCompleteProject}
              isCurrentUser={selectedProject.requestedBy === currentUser}
              currentUser={currentUser}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          )
        ) : currentRole === 'coordinator' ? (
          <CoordinatorPanel
            requests={requests}
            projects={projects}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        ) : currentRole === 'employee' ? (
          <EmployeePanel
            projects={projects}
            currentEmployee={currentUser}
            onSelectProject={setSelectedProject}
          />
        ) : (
          <div className="space-y-8">
            <RequestForm 
              onSubmit={handleNewRequest} 
              hasActiveProject={hasActiveProject}
              currentProject={currentUserProject}
              pendingRequest={currentUserPendingRequest}
              currentUser={currentUser}
            />
            {currentUserProject && (
              <ProjectCards
                project={currentUserProject}
                onSelectProject={setSelectedProject}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}