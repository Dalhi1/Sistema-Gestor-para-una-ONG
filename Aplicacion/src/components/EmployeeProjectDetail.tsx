import { ArrowLeft, FileText, Calendar, User, Download, CheckCircle2, XCircle, Check, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ProjectChat } from './ProjectChat';
import type { ChatMessage } from '../App';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import type { Project } from '../App';

interface EmployeeProjectDetailProps {
  project: Project;
  onBack: () => void;
  onApprovePhase: (projectId: string, phaseId: string) => void;
  onReturnPhase: (projectId: string, phaseId: string) => void;
  onCompleteProject: (projectId: string) => void;
  currentUser: string;
  chatMessages: ChatMessage[];
  onSendMessage: (projectId: string, message: string, senderRole: 'user' | 'employee') => void;
}

export function EmployeeProjectDetail({ 
  project, 
  onBack, 
  onApprovePhase, 
  onReturnPhase,
  onCompleteProject,
  currentUser,
  chatMessages,
  onSendMessage
}: EmployeeProjectDetailProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Educación': 'bg-blue-100 text-blue-700 border-blue-200',
      'Salud': 'bg-green-100 text-green-700 border-green-200',
      'Alimentación': 'bg-orange-100 text-orange-700 border-orange-200',
      'Animales': 'bg-purple-100 text-purple-700 border-purple-200',
      'Medio Ambiente': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Comunidad': 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPhaseIcon = (index: number) => {
    const icons = ['📋', '⚙️', '✅'];
    return icons[index] || '📁';
  };

  const getPhaseStatusBadge = (status: 'pending' | 'approved' | 'returned') => {
    if (status === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="size-3 mr-1" />
          Aprobada
        </Badge>
      );
    } else if (status === 'returned') {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="size-3 mr-1" />
          Devuelta
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pendiente
      </Badge>
    );
  };

  const totalFiles = project.phases.reduce((sum, phase) => sum + phase.files.length, 0);
  const approvedPhases = project.phases.filter(phase => phase.status === 'approved').length;
  const progressPercentage = (approvedPhases / project.phases.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4 mr-2" />
          Volver a proyectos
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle2 className="size-4 mr-2" />
              Finalizar Proyecto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar este proyecto?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará el proyecto como completado y lo eliminará de tu lista.
                Asegúrate de que todas las fases estén aprobadas antes de continuar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onCompleteProject(project.id)}>
                Sí, finalizar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="border-t-4"
        style={{
          borderTopColor: project.category === 'Educación' ? '#3b82f6' :
                          project.category === 'Salud' ? '#10b981' :
                          project.category === 'Alimentación' ? '#f97316' :
                          project.category === 'Animales' ? '#a855f7' :
                          project.category === 'Medio Ambiente' ? '#059669' :
                          project.category === 'Comunidad' ? '#ec4899' : '#6b7280'
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="mb-3">{project.title}</CardTitle>
              <Badge className={getCategoryColor(project.category)} variant="outline">
                {project.category}
              </Badge>
            </div>
          </div>
          <CardDescription className="mt-4">
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="size-4" />
              <span>Creado por: <span>{project.requestedBy}</span></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="size-4" />
              <span>Fecha: {project.createdAt.toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progreso de aprobación</span>
              <span>{approvedPhases} de {project.phases.length} fases aprobadas</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fases del Proyecto - Revisión</CardTitle>
          <CardDescription>
            Revisa los archivos subidos en cada fase y aprueba o devuelve según corresponda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="phase-1" className="w-full">
            {project.phases.map((phase, index) => (
              <AccordionItem key={phase.id} value={phase.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left w-full">
                    <span className="text-2xl">{getPhaseIcon(index)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{phase.name}</span>
                        {getPhaseStatusBadge(phase.status)}
                        {phase.files.length > 0 && (
                          <Badge variant="secondary">
                            {phase.files.length} archivo{phase.files.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{phase.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="text-sm mb-3">
                        Archivos subidos ({phase.files.length})
                      </h4>
                      {phase.files.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="size-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">No hay archivos en esta fase</p>
                          <p className="text-xs text-gray-500 mt-1">
                            El usuario aún no ha subido archivos
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {phase.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="size-5 text-blue-600" />
                                <div>
                                  <p className="text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Subido por {file.uploadedBy} el {file.uploadedAt.toLocaleDateString('es-ES')} • {file.size}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {phase.files.length > 0 && (
                      <div className="flex gap-3 pt-4 border-t">
                        {phase.status !== 'approved' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <RotateCcw className="size-4 mr-2" />
                                  Devolver Documentos
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Devolver documentos de esta fase?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Los archivos serán eliminados y el usuario deberá volver a subirlos.
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onReturnPhase(project.id, phase.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Sí, devolver
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => onApprovePhase(project.id, phase.id)}
                            >
                              <Check className="size-4 mr-2" />
                              Aprobar Fase
                            </Button>
                          </>
                        )}
                        {phase.status === 'approved' && (
                          <div className="flex-1 text-center py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                            <CheckCircle2 className="size-4 inline mr-2" />
                            Fase aprobada
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <ProjectChat
        projectId={project.id}
        messages={chatMessages}
        currentUser={currentUser}
        currentRole="employee"
        onSendMessage={(msg) => onSendMessage(project.id, msg, 'employee')}
        employeeName={project.assignedEmployee}
        userName={project.requestedBy}
      />
    </div>
  );
}
