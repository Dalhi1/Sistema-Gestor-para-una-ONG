import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import type { ChatMessage } from '../App';

interface ProjectChatProps {
  projectId: string;
  messages: ChatMessage[];
  currentUser: string;
  currentRole: 'user' | 'employee';
  onSendMessage: (message: string) => void;
  employeeName?: string;
  userName: string;
}

export function ProjectChat({ 
  projectId, 
  messages, 
  currentUser, 
  currentRole,
  onSendMessage,
  employeeName,
  userName
}: ProjectChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrar mensajes solo de este proyecto
  const projectMessages = messages.filter(m => m.projectId === projectId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-purple-600" />
          <CardTitle>Chat del Proyecto</CardTitle>
        </div>
        <CardDescription>
          {currentRole === 'employee' 
            ? `Conversación con ${userName} (Usuario)` 
            : employeeName 
              ? `Conversación con ${employeeName} (Empleado asignado)`
              : 'Aún no hay empleado asignado a este proyecto'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {projectMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No hay mensajes aún</p>
                  <p className="text-xs text-gray-400 mt-1">Envía un mensaje para comenzar la conversación</p>
                </div>
              ) : (
                <>
                  {projectMessages.map((msg) => {
                    const isCurrentUser = msg.sender === currentUser;
                    const isEmployee = msg.senderRole === 'employee';
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                          isEmployee ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {isEmployee ? (
                            <Briefcase className="size-4 text-purple-600" />
                          ) : (
                            <User className="size-4 text-blue-600" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-lg p-3 ${
                            isCurrentUser 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-xs opacity-75 mb-1">
                              {msg.sender} {isEmployee && '(Empleado)'}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'opacity-75' : 'text-gray-500'}`}>
                              {msg.timestamp.toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </ScrollArea>

          {(!employeeName && currentRole === 'user') ? (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-sm text-gray-600">
                El chat estará disponible cuando se asigne un empleado al proyecto
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
