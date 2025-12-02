import { useState } from 'react';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Request, Project } from '../App';
import { formatDate } from '../utils/dateHelpers';

interface CoordinatorPanelProps {
  requests: Request[];
  projects: Project[];
  onApprove: (requestId: string, employeeId?: string) => void;
  onReject: (requestId: string) => void;
}

export function CoordinatorPanel({ requests, projects, onApprove, onReject }: CoordinatorPanelProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<{ [requestId: string]: string }>({});

  // Lista de empleados disponibles
  const employees = [
    { id: 'andrea', name: 'Andrea' },
    { id: 'luis', name: 'Luis' },
    { id: 'sergio', name: 'Sergio' }
  ];

  // Contar proyectos activos por empleado
  const getEmployeeProjectCount = (employeeId: string) => {
    return projects.filter(p => p.assignedEmployee === employeeId && p.status !== 'completed').length;
  };

  // Verificar si un empleado puede recibir más proyectos
  const canAssignToEmployee = (employeeId: string) => {
    return getEmployeeProjectCount(employeeId) < 3;
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes</CardTitle>
          <CardDescription>
            Revisa y aprueba solicitudes de proyectos benéficos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 mb-2">No hay solicitudes pendientes</h3>
            <p className="text-sm text-gray-500">
              Las nuevas solicitudes aparecerán aquí para tu revisión.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes Pendientes</CardTitle>
        <CardDescription>
          Revisa y aprueba solicitudes de proyectos benéficos. ({requests.length} pendiente{requests.length !== 1 ? 's' : ''})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-yellow-400">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{request.title}</CardTitle>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="size-3 mr-1" />
                        Pendiente
                      </Badge>
                    </div>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{request.requestedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-end gap-3 pt-2 border-t">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-2 block">
                        Asignar empleado (requerido)
                      </label>
                      <Select
                        value={selectedEmployees[request.id] || ''}
                        onValueChange={(value) => 
                          setSelectedEmployees({ ...selectedEmployees, [request.id]: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => {
                            const projectCount = getEmployeeProjectCount(emp.id);
                            const isAvailable = canAssignToEmployee(emp.id);
                            return (
                              <SelectItem 
                                key={emp.id} 
                                value={emp.id}
                                disabled={!isAvailable}
                              >
                                {emp.name} ({projectCount}/3 proyectos)
                                {!isAvailable && ' - Límite alcanzado'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(request.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="size-4 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApprove(request.id, selectedEmployees[request.id])}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!selectedEmployees[request.id]}
                      >
                        <Check className="size-4 mr-1" />
                        Aprobar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
