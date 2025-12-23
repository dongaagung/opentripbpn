import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen, Trash2, Phone, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      setSelectedMessage(null);
      toast({
        title: "Pesan dihapus",
        description: "Pesan berhasil dihapus.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus pesan.",
        variant: "destructive",
      });
    },
  });

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = messages?.filter(m => !m.is_read).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pesan Masuk</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-3">
          {messages?.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada pesan masuk</p>
            </Card>
          ) : (
            messages?.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?.id === message.id 
                    ? 'ring-2 ring-primary' 
                    : ''
                } ${!message.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
                onClick={() => handleSelectMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!message.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <p className={`font-semibold truncate ${!message.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {message.name}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedMessage.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1 hover:text-primary">
                        <Mail className="w-4 h-4" />
                        {selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="w-4 h-4" />
                          {selectedMessage.phone}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(selectedMessage.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedMessage.is_read ? "secondary" : "default"}>
                      {selectedMessage.is_read ? (
                        <>
                          <MailOpen className="w-3 h-3 mr-1" />
                          Dibaca
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Baru
                        </>
                      )}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Pesan dari {selectedMessage.name} akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedMessage.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t flex gap-3">
                  <Button
                    onClick={() => window.open(`https://wa.me/${selectedMessage.phone?.replace(/\D/g, '')}`, '_blank')}
                    disabled={!selectedMessage.phone}
                    className="gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Balas via WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedMessage.email}`, '_blank')}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Balas via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Pilih pesan untuk melihat detail</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}