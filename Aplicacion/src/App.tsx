import { useState } from 'react';
import { Header } from './components/Header';
import { RequestForm } from './components/RequestForm';
import { ProjectCards } from './components/ProjectCards';
import { CoordinatorPanel } from './components/CoordinatorPanel';
import { ProjectDetail } from './components/ProjectDetail';
import { EmployeePanel } from './components/EmployeePanel';
import { EmployeeProjectDetail } from './components/EmployeeProjectDetail';
import { LoginScreen } from './components/LoginScreen';

export interface ProjectFile {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
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
  createdAt: Date;
  phases: Phase[];
  assignedEmployee?: string;
  completedBy?: string;
  completedAt?: Date;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  requestedBy: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  sender: string;
  senderRole: 'user' | 'employee';
  message: string;
  timestamp: Date;
}

export default function App() {
  // Estado de autenticación
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'user' | 'coordinator' | 'employee' | null>(null);

  // Datos globales que persisten entre sesiones
  const [requests, setRequests] = useState<Request[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Manejo de login
  const handleLogin = (username: string, role: 'user' | 'coordinator' | 'employee') => {
    setCurrentUser(username);
    setCurrentRole(role);
  };

  // Manejo de logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setSelectedProject(null);
  };

  // Verificar si el usuario actual ya tiene un proyecto aprobado
  const currentUserProject = currentUser ? projects.find((p) => p.requestedBy === currentUser) : undefined;
  const currentUserPendingRequest = currentUser ? requests.find((r) => r.requestedBy === currentUser) : undefined;
  const hasActiveProject = !!currentUserProject || !!currentUserPendingRequest;

  const handleNewRequest = (request: Omit<Request, 'id' | 'createdAt'>) => {
    const newRequest: Request = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setRequests([...requests, newRequest]);
  };

  const handleApproveRequest = (requestId: string, employeeId?: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
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
        ],
      };
      setProjects([...projects, newProject]);
      setRequests(requests.filter((r) => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const handleUploadFile = (projectId: string, phaseId: string, fileName: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const newFile: ProjectFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: fileName,
            uploadedBy: currentUser || 'Usuario',
            uploadedAt: new Date(),
            size: '1.2 MB',
          };
          return {
            ...p,
            phases: p.phases.map((phase) =>
              phase.id === phaseId
                ? { ...phase, files: [...phase.files, newFile] }
                : phase
            ),
          };
        }
        return p;
      })
    );
  };

  const handleCompleteProject = (projectId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'completed' as const,
            completedBy: currentUser,
            completedAt: new Date(),
          };
        }
        return p;
      })
    );
    setSelectedProject(null);
  };

  const handleApprovePhase = (projectId: string, phaseId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            phases: p.phases.map((phase) =>
              phase.id === phaseId ? { ...phase, status: 'approved' as const } : phase
            ),
          };
        }
        return p;
      })
    );
  };

  const handleReturnPhase = (projectId: string, phaseId: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            phases: p.phases.map((phase) =>
              phase.id === phaseId ? { ...phase, status: 'returned' as const, files: [] } : phase
            ),
          };
        }
        return p;
      })
    );
  };

  const handleSendMessage = (projectId: string, message: string, senderRole: 'user' | 'employee') => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      sender: currentUser || '',
      senderRole,
      message,
      timestamp: new Date(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  // Si no hay usuario logueado, mostrar pantalla de login
  if (!currentUser || !currentRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {selectedProject ? (
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