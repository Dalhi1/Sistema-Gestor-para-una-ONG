import { useState } from 'react';
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { Project, Request } from '../App';

interface RequestFormProps {
  onSubmit: (request: {
    title: string;
    description: string;
    category: string;
    requestedBy: string;
  }) => void;
  hasActiveProject: boolean;
  currentProject?: Project;
  pendingRequest?: Request;
  currentUser: string;
}

export function RequestForm({ onSubmit, hasActiveProject, currentProject, pendingRequest, currentUser }: RequestFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    requestedBy: currentUser,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, requestedBy: currentUser });
    setFormData({ title: '', description: '', category: '', requestedBy: currentUser });
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Nuevo Proyecto</CardTitle>
        <CardDescription>
          Solo puedes tener un proyecto activo a la vez. {hasActiveProject ? 'Completa tu proyecto actual para crear uno nuevo.' : 'Crea una solicitud para apoyar una causa benéfica.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequest && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="size-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Solicitud Pendiente</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Tu solicitud "<span>{pendingRequest.title}</span>" está en revisión. Un coordinador la aprobará pronto.
            </AlertDescription>
          </Alert>
        )}

        {currentProject && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="size-4 text-green-600" />
            <AlertTitle className="text-green-800">Proyecto Activo</AlertTitle>
            <AlertDescription className="text-green-700">
              Ya tienes un proyecto aprobado: "<span>{currentProject.title}</span>". Complétalo para poder crear un nuevo proyecto.
            </AlertDescription>
          </Alert>
        )}

        {!hasActiveProject && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>Sin Proyectos Activos</AlertTitle>
            <AlertDescription>
              No tienes ningún proyecto activo. ¡Crea una solicitud para comenzar a apoyar una causa benéfica!
            </AlertDescription>
          </Alert>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" disabled={hasActiveProject}>
              <Plus className="size-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Crear Solicitud de Proyecto</DialogTitle>
              <DialogDescription>
                Completa los detalles de tu proyecto benéfico. El coordinador lo revisará pronto.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Proyecto</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Recaudación de fondos para..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu proyecto y cómo ayudará a la comunidad..."
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Alimentación">Alimentación</SelectItem>
                    <SelectItem value="Animales">Animales</SelectItem>
                    <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                    <SelectItem value="Comunidad">Comunidad</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Enviar Solicitud</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}