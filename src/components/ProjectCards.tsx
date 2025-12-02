import { Calendar, User, FolderOpen, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import type { Project } from '../App';
import { formatDate } from '../utils/dateHelpers';

interface ProjectCardsProps {
  project: Project;
  onSelectProject: (project: Project) => void;
}

export function ProjectCards({ project, onSelectProject }: ProjectCardsProps) {
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

  const totalFiles = project.phases.reduce((sum, phase) => sum + phase.files.length, 0);

  return (
    <div>
      <h2 className="text-gray-900 mb-6">Mi Proyecto Aprobado</h2>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 max-w-2xl"
        style={{
          borderTopColor: project.category === 'Educación' ? '#3b82f6' :
                          project.category === 'Salud' ? '#10b981' :
                          project.category === 'Alimentación' ? '#f97316' :
                          project.category === 'Animales' ? '#a855f7' :
                          project.category === 'Medio Ambiente' ? '#059669' :
                          project.category === 'Comunidad' ? '#ec4899' : '#6b7280'
        }}
        onClick={() => onSelectProject(project)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
          </div>
          <Badge className={getCategoryColor(project.category)} variant="outline">
            {project.category}
          </Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3 mb-4">
            {project.description}
          </CardDescription>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span>{project.requestedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="size-4" />
              <span>{project.phases.length} fases</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4" />
              <span>{totalFiles} archivo(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}