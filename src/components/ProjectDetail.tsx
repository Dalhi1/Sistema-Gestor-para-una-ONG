import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Calendar, User, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { ProjectChat } from './ProjectChat';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import type { ChatMessage } from '../App';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import type { Project } from '../App';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUploadFile: (projectId: string, phaseId: string, fileName: string) => void;
  onCompleteProject: (projectId: string) => void;
  isCurrentUser: boolean;
  currentUser: string;
  chatMessages: ChatMessage[];
  onSendMessage: (projectId: string, message: string, senderRole: 'user' | 'employee') => void;
}

export function ProjectDetail({ 
  project, 
  onBack, 
  onUploadFile, 
  onCompleteProject, 
  isCurrentUser,
  currentUser,
  chatMessages,
  onSendMessage
}: ProjectDetailProps) {
  const [selectedFiles, setSelectedFiles] = useState<{ [phaseId: string]: File | null }>({});
  const [uploadingPhase, setUploadingPhase] = useState<string | null>(null);
  const [prevPhases, setPrevPhases] = useState(project.phases);

  // Detectar cambios en las fases para mostrar animación cuando se aprueba
  useEffect(() => {
    const newlyApproved = project.phases.filter((phase, index) => 
      phase.status === 'approved' && prevPhases[index]?.status !== 'approved'
    );
    
    if (newlyApproved.length > 0) {
      newlyApproved.forEach(phase => {
        toast.success(`¡Fase "${phase.name}" aprobada!`, {
          description: 'El empleado ha revisado y aprobado esta fase.',
        });
      });
    }

    setPrevPhases(project.phases);
  }, [project.phases]);

  // Mostrar alerta si el proyecto fue completado
  useEffect(() => {
    if (project.status === 'completed' && project.completedBy) {
      toast.success('🎉 ¡Proyecto Finalizado!', {
        description: `Tu proyecto ha sido completado exitosamente por ${project.completedBy}.`,
        duration: 5000,
      });
    }
  }, [project.status, project.completedBy]);

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

  const handleFileChange = (phaseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles({ ...selectedFiles, [phaseId]: e.target.files[0] });
    }
  };

  const handleUpload = async (phaseId: string) => {
    const selectedFile = selectedFiles[phaseId];
    if (selectedFile) {
      setUploadingPhase(phaseId);
      
      // Simular upload con animación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUploadFile(project.id, phaseId, selectedFile.name);
      setSelectedFiles({ ...selectedFiles, [phaseId]: null });
      setUploadingPhase(null);
      
      // Reset input
      const input = document.getElementById(`file-upload-${phaseId}`) as HTMLInputElement;
      if (input) input.value = '';
      
      toast.success('Archivo subido exitosamente', {
        description: `${selectedFile.name} ha sido agregado a la fase.`,
      });
    }
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
          Devuelta - Subir nuevamente
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pendiente de revisión
      </Badge>
    );
  };

  const totalFiles = project.phases.reduce((sum, phase) => sum + phase.files.length, 0);
  const approvedPhases = project.phases.filter(phase => phase.status === 'approved').length;
  const progressPercentage = (approvedPhases / project.phases.length) * 100;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="size-4 mr-2" />
        Volver a mi proyecto
      </Button>

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
          <CardTitle>Fases del Proyecto</CardTitle>
          <CardDescription>
            Cada proyecto se divide en 3 fases. Sube archivos en cada fase para documentar tu progreso.
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
                    {isCurrentUser && phase.status !== 'approved' && (
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="text-sm mb-3">Subir archivo a esta fase</h4>
                        {phase.status === 'returned' && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">
                              ⚠️ Los documentos fueron devueltos. Por favor, revisa y sube nuevamente.
                            </p>
                          </div>
                        )}
                        <div className="flex items-end gap-4">
                          <div className="flex-1">
                            <Label htmlFor={`file-upload-${phase.id}`}>Seleccionar archivo</Label>
                            <Input
                              id={`file-upload-${phase.id}`}
                              type="file"
                              onChange={(e) => handleFileChange(phase.id, e)}
                              className="mt-2"
                            />
                          </div>
                          <Button 
                            onClick={() => handleUpload(phase.id)} 
                            disabled={!selectedFiles[phase.id] || uploadingPhase === phase.id}
                          >
                            {uploadingPhase === phase.id ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="size-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                                />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="size-4 mr-2" />
                                Subir
                              </>
                            )}
                          </Button>
                        </div>
                        {selectedFiles[phase.id] && (
                          <p className="text-sm text-gray-600 mt-2">
                            Archivo seleccionado: {selectedFiles[phase.id]?.name}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {isCurrentUser && phase.status === 'approved' && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="size-5" />
                          <div>
                            <h4 className="text-sm">Fase aprobada</h4>
                            <p className="text-xs mt-1">Esta fase ha sido revisada y aprobada por el empleado asignado.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm mb-3">
                        Archivos subidos ({phase.files.length})
                      </h4>
                      {phase.files.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="size-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">No hay archivos en esta fase</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isCurrentUser ? 'Sube archivos para documentar esta fase' : 'Aún no se han subido archivos'}
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {isCurrentUser && (
        <ProjectChat
          projectId={project.id}
          messages={chatMessages}
          currentUser={currentUser}
          currentRole="user"
          onSendMessage={(msg) => onSendMessage(project.id, msg, 'user')}
          employeeName={project.assignedEmployee}
          userName={project.requestedBy}
        />
      )}
    </div>
  );
}
