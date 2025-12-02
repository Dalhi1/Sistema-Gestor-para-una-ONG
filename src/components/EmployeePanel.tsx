import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ProjectCards } from './ProjectCards';
import type { Project } from '../App';

interface EmployeePanelProps {
  projects: Project[];
  currentEmployee: string;
  onSelectProject: (project: Project) => void;
}

export function EmployeePanel({ projects, currentEmployee, onSelectProject }: EmployeePanelProps) {
  // Filtrar solo los proyectos asignados a este empleado Y que NO estén completados
  const assignedProjects = projects.filter(p => 
    p.assignedEmployee === currentEmployee && p.status !== 'completed'
  );

  if (assignedProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Proyectos Asignados</CardTitle>
          <CardDescription>
            Proyectos que te han sido asignados para revisar y aprobar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Briefcase className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-600 mb-2">No tienes proyectos asignados</h3>
            <p className="text-sm text-gray-500">
              Cuando un coordinador te asigne un proyecto, aparecerá aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mis Proyectos Asignados</CardTitle>
          <CardDescription>
            Tienes {assignedProjects.length} proyecto{assignedProjects.length !== 1 ? 's' : ''} asignado{assignedProjects.length !== 1 ? 's' : ''} para revisar.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignedProjects.map((project) => (
          <ProjectCards
            key={project.id}
            project={project}
            onSelectProject={onSelectProject}
          />
        ))}
      </div>
    </div>
  );
}