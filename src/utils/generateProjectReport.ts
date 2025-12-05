// Utils/generateProjectReport.ts
import jsPDF from 'jspdf';
import { projectAPI, dataAPI } from '../utils/supabase/client';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  requestedBy: string;
  assignedEmployee: string;
  createdAt: string | Date;
  status: string;
  phases: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    files: Array<{
      id: string;
      name: string;
      uploadedBy: string;
      uploadedAt: string | Date;
      size: string;
    }>;
  }>;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string | Date;
  senderRole: string;
  projectId: string;
}

export async function generateProjectReport(projectId: string): Promise<void> {
  try {
    console.log('📄 Generando reporte para proyecto:', projectId);

    // 1. Obtener el proyecto específico
    const project: ProjectData = await projectAPI.getOne(projectId);
    
    if (!project) {
      throw new Error('Proyecto no encontrado');
    }

    console.log('✅ Proyecto obtenido:', project.title);

    // 2. Obtener todos los datos para filtrar mensajes
    const allData = await dataAPI.getAll();
    const projectMessages: ChatMessage[] = allData.chat?.filter(
      (msg: any) => msg.projectId === projectId
    ) || [];

    console.log('✅ Mensajes del chat obtenidos:', projectMessages.length);

    // 3. Crear el PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Configurar fuente
    doc.setFont('helvetica');

    // ==================== ENCABEZADO ====================
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234); // Color morado
    doc.text('Reporte de Proyecto', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Línea decorativa
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // ==================== INFORMACIÓN GENERAL ====================
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Información General', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const generalInfo = [
      `Título: ${project.title}`,
      `Categoría: ${project.category}`,
      `Solicitado por: ${project.requestedBy}`,
      `Empleado asignado: ${project.assignedEmployee}`,
      `Fecha de creación: ${formatDate(project.createdAt)}`,
      `Estado: ${getStatusText(project.status)}`,
    ];

    generalInfo.forEach(line => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // ==================== DESCRIPCIÓN ====================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 20, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitDescription = doc.splitTextToSize(project.description, 170);
    doc.text(splitDescription, 25, yPosition);
    yPosition += splitDescription.length * 5 + 10;

    // ==================== FASES DEL PROYECTO ====================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fases del Proyecto', 20, yPosition);
    yPosition += 8;

    project.phases.forEach((phase, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${phase.name}`, 25, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Estado: ${getStatusText(phase.status)}`, 30, yPosition);
      yPosition += 5;

      const splitPhaseDesc = doc.splitTextToSize(phase.description, 160);
      doc.text(splitPhaseDesc, 30, yPosition);
      yPosition += splitPhaseDesc.length * 5 + 3;

      // Archivos de la fase
      if (phase.files && phase.files.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.text(`Archivos (${phase.files.length}):`, 30, yPosition);
        yPosition += 5;

        phase.files.forEach(file => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFont('helvetica', 'normal');
          const fileDate = formatDate(file.uploadedAt);
          doc.text(`• ${file.name} - Subido por ${file.uploadedBy} (${fileDate})`, 35, yPosition);
          yPosition += 5;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(128, 128, 128);
        doc.text('No hay archivos en esta fase', 30, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
      }

      yPosition += 5;
    });

    // ==================== ESTADÍSTICAS ====================
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estadísticas', 20, yPosition);
    yPosition += 8;

    const totalFiles = project.phases.reduce((sum, phase) => sum + (phase.files?.length || 0), 0);
    const approvedPhases = project.phases.filter(p => p.status === 'approved').length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de fases: ${project.phases.length}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Fases aprobadas: ${approvedPhases}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Total de archivos: ${totalFiles}`, 25, yPosition);
    yPosition += 10;

    // ==================== MENSAJES DEL CHAT ====================
    if (projectMessages && projectMessages.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Historial de Comunicación', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      // Mostrar últimos 15 mensajes
      const recentMessages = projectMessages.slice(-15);
      
      recentMessages.forEach(msg => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const roleLabel = msg.senderRole === 'employee' ? '(Empleado)' : '(Usuario)';
        doc.setFont('helvetica', 'bold');
        doc.text(`${msg.sender} ${roleLabel}:`, 25, yPosition);
        yPosition += 4;

        doc.setFont('helvetica', 'normal');
        const splitMsg = doc.splitTextToSize(msg.message, 160);
        doc.text(splitMsg, 30, yPosition);
        yPosition += splitMsg.length * 4 + 2;

        // Timestamp
        const msgTime = formatDate(msg.timestamp);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(msgTime, 30, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        yPosition += 5;
      });

      if (projectMessages.length > 15) {
        doc.setFont('helvetica', 'italic');
        doc.text(`... y ${projectMessages.length - 15} mensajes más`, 25, yPosition);
      }
    }

    // ==================== PIE DE PÁGINA ====================
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleDateString('es-ES')}`,
        105,
        290,
        { align: 'center' }
      );
    }

    // ==================== DESCARGAR PDF ====================
    const fileName = `Reporte_${project.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);

    console.log('✅ Reporte generado exitosamente:', fileName);
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error);
    throw error;
  }
}

// ==================== FUNCIONES AUXILIARES ====================

function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return 'Fecha no disponible';
  }
}

function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'completed': 'Completado',
    'returned': 'Devuelto',
  };
  return statusMap[status] || status;
}