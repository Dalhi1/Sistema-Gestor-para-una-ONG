import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { RefreshCw, Database, Users, FileText, MessageSquare, FolderKanban, Trash2, UserX } from 'lucide-react';
import { dataAPI, authAPI } from '../utils/supabase/client';
import { clearRegisteredUsers } from '../utils/supabase/fallback';
import { toast } from 'sonner@2.0.3';

interface DataEntry {
  id: string;
  [key: string]: any;
}

export function DataViewer() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('');
    try {
      console.log('🔄 Loading data from dataAPI...');
      const data = await dataAPI.getAll();
      console.log('📊 Data received:', data);
      
      setUsers(data.users || []);
      setRequests(data.requests || []);
      setProjects(data.projects || []);
      setChats(data.chat || []);
      
      console.log('✅ Data loaded:', {
        users: data.users?.length || 0,
        requests: data.requests?.length || 0,
        projects: data.projects?.length || 0,
        chats: data.chat?.length || 0
      });
    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(`Error cargando datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDebugInfo = () => {
    try {
      const localStorageData = {
        users: localStorage.getItem('charity_homework_users'),
        requests: localStorage.getItem('charity_homework_requests'),
        projects: localStorage.getItem('charity_homework_projects'),
        chat: localStorage.getItem('charity_homework_chat')
      };
      setDebugInfo(JSON.stringify(localStorageData, null, 2));
      console.log('💾 LocalStorage contents:', localStorageData);
    } catch (err) {
      setDebugInfo('Error al leer localStorage: ' + err);
    }
  };

  const handleClearUsers = () => {
    const confirmMsg = '⚠️ ADVERTENCIA: Esto eliminará TODOS los usuarios registrados del sistema.\n\n' +
                       'Los usuarios predefinidos (admin, andrea, luis, sergio) seguirán funcionando.\n\n' +
                       '¿Estás seguro de que quieres continuar?';
    
    if (confirm(confirmMsg)) {
      console.log('🗑️ Usuario confirmó la eliminación de usuarios');
      const success = clearRegisteredUsers();
      
      if (success) {
        console.log('✅ Usuarios eliminados exitosamente, recargando datos...');
        // Recargar datos inmediatamente después de limpiar
        setTimeout(() => {
          loadData();
        }, 100);
        
        toast.success('✅ Usuarios eliminados', {
          description: 'Todos los usuarios registrados han sido eliminados del localStorage'
        });
      } else {
        toast.error('❌ Error al eliminar usuarios', {
          description: 'Hubo un problema al eliminar los usuarios'
        });
      }
    } else {
      console.log('❌ Usuario canceló la eliminación de usuarios');
    }
  };

  const handleDeleteUser = async (username: string) => {
    // No permitir eliminar usuarios del sistema
    const systemUsers = ['admin', 'andrea', 'luis', 'sergio'];
    if (systemUsers.includes(username.toLowerCase())) {
      toast.error('❌ No se puede eliminar', {
        description: 'Los usuarios del sistema no pueden ser eliminados'
      });
      return;
    }

    const confirmMsg = `⚠️ ¿Eliminar usuario "${username}"?\n\n` +
                       'Esto eliminará también:\n' +
                       '• Todas las solicitudes del usuario\n' +
                       '• Todos los proyectos del usuario\n' +
                       '• Todos los mensajes de chat relacionados\n\n' +
                       'Esta acción no se puede deshacer.';
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      console.log('🗑️ Eliminando usuario:', username);
      const result = await authAPI.deleteUser(username);
      
      console.log('✅ Usuario eliminado:', result);
      
      toast.success('✅ Usuario eliminado', {
        description: `Se eliminaron ${result.deletedProjects || 0} proyecto(s) y ${result.deletedRequests || 0} solicitud(es)`
      });
      
      // Recargar datos
      setTimeout(() => {
        loadData();
      }, 100);
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error);
      toast.error('❌ Error al eliminar usuario', {
        description: error.message || 'Hubo un problema al eliminar el usuario'
      });
    }
  };

  useEffect(() => {
    loadData();
    
    // Debug: Mostrar contenido de localStorage al cargar
    console.log('🔍 Verificando localStorage al cargar DataViewer...');
    const users = localStorage.getItem('charity_homework_users');
    const requests = localStorage.getItem('charity_homework_requests');
    const projects = localStorage.getItem('charity_homework_projects');
    const chat = localStorage.getItem('charity_homework_chat');
    
    console.log('📦 charity_homework_users:', users ? JSON.parse(users).length + ' usuarios' : 'null/vacío');
    console.log('📦 charity_homework_requests:', requests ? JSON.parse(requests).length + ' solicitudes' : 'null/vacío');
    console.log('📦 charity_homework_projects:', projects ? JSON.parse(projects).length + ' proyectos' : 'null/vacío');
    console.log('📦 charity_homework_chat:', chat ? JSON.parse(chat).length + ' mensajes' : 'null/vacío');
  }, []);

  const renderValue = (value: any, hidePassword: boolean = true) => {
    if (typeof value === 'object') {
      // Si es un objeto de usuario, ocultar la contraseña
      const displayValue = hidePassword && value.password 
        ? { ...value, password: '••••••••' }
        : value;
      
      return (
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(displayValue, null, 2)}
        </pre>
      );
    }
    return <p className="text-sm">{String(value)}</p>;
  };

  const totalEntries = users.length + requests.length + projects.length + chats.length;
  const activeProjects = projects.filter(p => p.status !== 'completed');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-2 mb-2">
            <Database className="h-6 w-6" />
            Visor de Base de Datos
          </h1>
          <p className="text-sm text-gray-600">
            Explora todos los datos almacenados en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={showDebugInfo}>
            🔍 Debug Info
          </Button>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          <Button variant="destructive" onClick={handleClearUsers}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Usuarios
          </Button>
        </div>
      </div>

      {debugInfo && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Información de Depuración</CardTitle>
            <CardDescription>Datos brutos de localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-96 bg-white p-4 rounded">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Database className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({users.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            Solicitudes ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban className="h-4 w-4 mr-2" />
            Proyectos ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="chats">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats ({chats.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl">{users.length}</p>
                <p className="text-sm text-gray-600">Total de cuentas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl">{requests.length}</p>
                <p className="text-sm text-gray-600">Pendientes de revisión</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl">{projects.length}</p>
                <p className="text-sm text-gray-600">
                  {activeProjects.length} activo{activeProjects.length !== 1 ? 's' : ''} 
                  {completedProjects.length > 0 && `, ${completedProjects.length} completado${completedProjects.length !== 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl">{chats.length}</p>
                <p className="text-sm text-gray-600">En conversaciones</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Datos ({totalEntries} entradas)</CardTitle>
              <CardDescription>
                Vista general de todos los datos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">Usuarios</Badge>
                      <span className="text-sm text-gray-600">{users.length} registros</span>
                    </h3>
                    <div className="text-xs text-gray-500">
                      {users.map((user: any) => user.username).join(', ')}
                    </div>
                  </div>
                )}
                
                {requests.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">Solicitudes</Badge>
                      <span className="text-sm text-gray-600">{requests.length} registros</span>
                    </h3>
                    <div className="text-xs text-gray-500">
                      {requests.map((req: any) => req.title).join(', ')}
                    </div>
                  </div>
                )}
                
                {projects.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">Proyectos</Badge>
                      <span className="text-sm text-gray-600">{projects.length} registros</span>
                    </h3>
                    <div className="text-xs text-gray-500">
                      {projects.map((proj: any) => proj.title).join(', ')}
                    </div>
                  </div>
                )}
                
                {chats.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">Mensajes</Badge>
                      <span className="text-sm text-gray-600">{chats.length} registros</span>
                    </h3>
                  </div>
                )}
                
                {totalEntries === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay datos en el sistema todavía
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Registrados</CardTitle>
              <CardDescription>
                Todas las cuentas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay usuarios registrados todavía
                    </p>
                  ) : (
                    users.map((user, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{user.fullName || user.username}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{user.role}</Badge>
                              {!['admin', 'andrea', 'luis', 'sergio'].includes(user.username.toLowerCase()) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.username)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>{renderValue(user)}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>
                Esperando aprobación del coordinador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay solicitudes pendientes
                    </p>
                  ) : (
                    requests.map((request, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {request.title}
                          </CardTitle>
                          <CardDescription>
                            Solicitado por: {request.requestedBy}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>{renderValue(request, false)}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos Aprobados</CardTitle>
              <CardDescription>
                En las fases de Planificación, Ejecución y Cierre (incluyendo completados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay proyectos aprobados todavía
                    </p>
                  ) : (
                    projects.map((project, index) => (
                      <Card key={index} className={project.status === 'completed' ? 'border-green-300 bg-green-50' : ''}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{project.title}</span>
                            <div className="flex gap-2">
                              <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                                {project.status === 'completed' ? '✅ Completado' : project.status}
                              </Badge>
                              {project.status === 'completed' && (
                                <Badge variant="secondary">
                                  Finalizado por: {project.completedBy}
                                </Badge>
                              )}
                            </div>
                          </CardTitle>
                          <CardDescription>
                            {project.status === 'completed' ? (
                              <span className="text-green-700">
                                🎉 Este proyecto fue completado exitosamente el {new Date(project.completedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <>Asignado a: {project.assignedEmployee || 'Sin asignar'}</>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>{renderValue(project, false)}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes de Chat</CardTitle>
              <CardDescription>
                Conversaciones entre empleados y usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {chats.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay mensajes todavía
                    </p>
                  ) : (
                    chats.map((chat, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge variant={chat.senderRole === 'employee' ? 'default' : 'secondary'}>
                              {chat.senderRole === 'employee' ? 'Empleado' : 'Usuario'}
                            </Badge>
                            {chat.sender}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>{renderValue(chat, false)}</CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}