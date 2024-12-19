import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { useSessions, Session } from "@/hooks/useSessions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionManagerProps {
  onLoadSession: (session: Session) => void;
  onSaveSession: (name: string) => Promise<void>;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  onLoadSession,
  onSaveSession,
}) => {
  const { sessions, deleteSession } = useSessions();
  const [isOpen, setIsOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSession = async () => {
    if (!newSessionName.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await onSaveSession(newSessionName.trim());
      setNewSessionName("");
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Sessão
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nome da sessão"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
              <Button onClick={handleSaveSession} disabled={isSaving}>
                Salvar
              </Button>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.name}</TableCell>
                      <TableCell>
                        {format(new Date(session.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onLoadSession(session)}
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};