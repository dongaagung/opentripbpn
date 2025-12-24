import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
}

const FAQAdmin = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    question: '',
    answer: '',
    display_order: 0,
    is_published: true,
  });

  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setFaqs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const resetForm = () => {
    setFormData({
      id: '',
      question: '',
      answer: '',
      display_order: faqs.length + 1,
      is_published: true,
    });
    setIsEditing(false);
  };

  const openDialog = (faq?: FAQ) => {
    if (faq) {
      setFormData(faq);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({ title: "Error", description: "Pertanyaan dan jawaban harus diisi", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question,
            answer: formData.answer,
            display_order: formData.display_order,
            is_published: formData.is_published,
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast({ title: "Berhasil", description: "FAQ berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: formData.question,
            answer: formData.answer,
            display_order: formData.display_order,
            is_published: formData.is_published,
          });

        if (error) throw error;
        toast({ title: "Berhasil", description: "FAQ berhasil ditambahkan" });
      }

      setDialogOpen(false);
      fetchFAQs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;

    const { error } = await supabase.from('faqs').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "FAQ berhasil dihapus" });
      fetchFAQs();
    }
  };

  return (
    <div className="flex-1 p-8">
      <AdminHeader 
        title="Kelola FAQ" 
        subtitle="Kelola pertanyaan yang sering ditanyakan"
      />

      <div className="mb-6">
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah FAQ
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : faqs.length === 0 ? (
        <p className="text-muted-foreground">Belum ada FAQ.</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="p-4 rounded-xl border bg-card flex justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    #{faq.display_order}
                  </span>
                  {!faq.is_published && (
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{faq.question}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openDialog(faq)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(faq.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit FAQ' : 'Tambah FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pertanyaan</Label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Masukkan pertanyaan"
                rows={2}
              />
            </div>
            <div>
              <Label>Jawaban</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Masukkan jawaban"
                rows={4}
              />
            </div>
            <div>
              <Label>Urutan</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label>Publikasikan</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Menyimpan...' : (isEditing ? 'Update' : 'Simpan')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQAdmin;
