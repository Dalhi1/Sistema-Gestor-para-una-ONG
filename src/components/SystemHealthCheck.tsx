import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Database, Server, Code } from 'lucide-react';
import { authAPI, requestAPI, projectAPI, chatAPI } from '../utils/supabase/client';

interface HealthCheck {
  name: string;
  status: 'success' | 'error' | 'checking';
  message: string;
  icon: React.ElementType;
}

export function SystemHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'CAPA 1: Frontend', status: 'success', message: 'React cargado correctamente', icon: Code },
    { name: 'CAPA 2: Backend API', status: 'checking', message: 'Verificando...', icon: Server },
    { name: 'CAPA 3: localStorage', status: 'checking', message: 'Verificando...', icon: Database },
  ]);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    const newChecks: HealthCheck[] = [];

    // Check 1: Frontend
    newChecks.push({
      name: 'CAPA 1: Frontend React',
      status: 'success',
      message: '✅ Componentes renderizando correctamente',
      icon: Code
    });

    // Check 2: Backend API
    try {
      const users = await authAPI.getAllUsers();
      newChecks.push({
        name: 'CAPA 2: Backend API',
        status: 'success',
        message: `✅ API funcional - ${users.length} usuarios en sistema`,
        icon: Server
      });
    } catch (error) {
      newChecks.push({
        name: 'CAPA 2: Backend API',
        status: 'error',
        message: '❌ Error al conectar con API',
        icon: Server
      });
    }

    // Check 3: localStorage
    try {
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const usersCount = JSON.parse(localStorage.getItem('charity_users') || '[]').length;
      const requestsCount = JSON.parse(localStorage.getItem('charity_requests') || '[]').length;
      const projectsCount = JSON.parse(localStorage.getItem('charity_projects') || '[]').length;

      newChecks.push({
        name: 'CAPA 3: localStorage',
        status: 'success',
        message: `✅ Persistencia funcional - ${usersCount} usuarios, ${requestsCount} solicitudes, ${projectsCount} proyectos`,
        icon: Database
      });
    } catch (error) {
      newChecks.push({
        name: 'CAPA 3: localStorage',
        status: 'error',
        message: '❌ localStorage no disponible',
        icon: Database
      });
    }

    // Check 5: Request system
    try {
      const requests = await requestAPI.getAll();
      newChecks.push({
        name: 'Sistema de Solicitudes',
        status: 'success',
        message: `✅ Funcional - ${requests.length} solicitudes activas`,
        icon: CheckCircle2
      });
    } catch (error) {
      newChecks.push({
        name: 'Sistema de Solicitudes',
        status: 'error',
        message: '❌ Error en sistema de solicitudes',
        icon: XCircle
      });
    }

    // Check 6: Project system
    try {
      const projects = await projectAPI.getAll();
      newChecks.push({
        name: 'Sistema de Proyectos',
        status: 'success',
        message: `✅ Funcional - ${projects.length} proyectos activos`,
        icon: CheckCircle2
      });
    } catch (error) {
      newChecks.push({
        name: 'Sistema de Proyectos',
        status: 'error',
        message: '❌ Error en sistema de proyectos',
        icon: XCircle
      });
    }

    setChecks(newChecks);
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {successCount === checks.length ? (
            <CheckCircle2 className="size-6 text-green-500" />
          ) : errorCount > 0 ? (
            <XCircle className="size-6 text-red-500" />
          ) : (
            <AlertCircle className="size-6 text-yellow-500" />
          )}
          Verificación del Sistema
        </CardTitle>
        <CardDescription>
          Estado de la arquitectura de 3 capas - {successCount}/{checks.length} componentes funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Icon className={`size-5 ${
                  check.status === 'success' ? 'text-green-500' :
                  check.status === 'error' ? 'text-red-500' :
                  'text-yellow-500'
                }`} />
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
              <Badge variant={
                check.status === 'success' ? 'default' :
                check.status === 'error' ? 'destructive' :
                'secondary'
              }>
                {check.status === 'success' ? 'OK' :
                 check.status === 'error' ? 'Error' :
                 'Checking...'}
              </Badge>
            </div>
          );
        })}

        {/* Success message */}
        {successCount === checks.length && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  ✅ Sistema completamente funcional
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Todas las capas de la arquitectura están operativas.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
