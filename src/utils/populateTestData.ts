//Este codigo es una función de desarrollo o pruebas que crea datos falsos (de ejemplo) y los guarda en el localStorage del navegador para que la aplicación pueda probarse sin necesidad de conectarse al backend (Supabase).

export const populateTestData = () => {
  console.log('🌱 Poblando datos de prueba en localStorage...');
  
  // Usuarios de prueba
  const testUsers = [
    {
      id: 'test-user-1',
      username: 'maria',
      password: '1234',
      fullName: 'María González',
      age: 25,
      gender: 'Femenino',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 'test-user-2',
      username: 'juan',
      password: '1234',
      fullName: 'Juan Pérez',
      age: 30,
      gender: 'Masculino',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];
  
  // Solicitudes de prueba
  const testRequests = [
    {
      id: 'test-request-1',
      title: 'Campaña de donación de alimentos',
      description: 'Organizar una campaña de recolección de alimentos para comunidades vulnerables',
      category: 'Alimentación',
      requestedBy: 'maria',
      createdAt: new Date().toISOString()
    },
    {
      id: 'test-request-2',
      title: 'Programa de educación ambiental',
      description: 'Desarrollar talleres educativos sobre reciclaje y cuidado del medio ambiente',
      category: 'Educación',
      requestedBy: 'juan',
      createdAt: new Date().toISOString()
    }
  ];
  
  // Proyectos de prueba
  const testProjects = [
    {
      id: 'test-project-1',
      title: 'Jornada de salud comunitaria',
      description: 'Organizar jornadas médicas gratuitas en zonas rurales',
      category: 'Salud',
      requestedBy: 'maria',
      assignedEmployee: 'andrea',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      phases: [
        {
          id: 'phase-1',
          name: 'Planificación',
          description: 'Fase de planificación del proyecto',
          status: 'approved',
          files: [
            {
              id: 'file-1',
              name: 'Plan_de_trabajo.pdf',
              uploadedBy: 'maria',
              uploadedAt: new Date().toISOString(),
              size: '245 KB'
            }
          ]
        },
        {
          id: 'phase-2',
          name: 'Ejecución',
          description: 'Fase de ejecución del proyecto',
          status: 'pending',
          files: []
        },
        {
          id: 'phase-3',
          name: 'Cierre',
          description: 'Fase de cierre del proyecto',
          status: 'pending',
          files: []
        }
      ]
    }
  ];
  
  // Mensajes de chat de prueba
  const testChats = [
    {
      id: 'chat-1',
      projectId: 'test-project-1',
      sender: 'maria',
      senderRole: 'user',
      message: 'Hola, ya subí el documento de planificación',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'chat-2',
      projectId: 'test-project-1',
      sender: 'Andrea',
      senderRole: 'employee',
      message: 'Perfecto, voy a revisarlo',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ];
  
  // Guardar en localStorage
  localStorage.setItem('charity_homework_users', JSON.stringify(testUsers));
  localStorage.setItem('charity_homework_requests', JSON.stringify(testRequests));
  localStorage.setItem('charity_homework_projects', JSON.stringify(testProjects));
  localStorage.setItem('charity_homework_chat', JSON.stringify(testChats));
  
  console.log('✅ Datos de prueba guardados:');
  console.log('  - Usuarios:', testUsers.length);
  console.log('  - Solicitudes:', testRequests.length);
  console.log('  - Proyectos:', testProjects.length);
  console.log('  - Mensajes:', testChats.length);
  console.log('');
  console.log('💡 Recarga la página para ver los datos en "Ver BD"');
  
  return {
    users: testUsers,
    requests: testRequests,
    projects: testProjects,
    chats: testChats
  };
};


if (typeof window !== 'undefined') {
  (window as any).populateTestData = populateTestData;
  console.log('💡 Para poblar datos de prueba, ejecuta: populateTestData()');
}
