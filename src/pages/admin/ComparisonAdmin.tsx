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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComparisonItem {
  id: string;
  category: string;
  our_way_title: string;
  our_way_description: string;
  our_way_icon: string;
  other_way_title: string;
  other_way_description: string;
  other_way_icon: string;
  display_order: number;
  is_published: boolean;
}

const iconOptions = [
  'heart', 'users', 'train', 'bus', 'coffee', 'clock', 
  'briefcase', 'shuffle', 'lock', 'compass', 'mappin', 'wallet', 'user', 'check', 'x'
];

const ComparisonAdmin = () => {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    category: '',
    our_way_title: '',
    our_way_description: '',
    our_way_icon: 'check',
    other_way_title: '',
    other_way_description: '',
    other_way_icon: 'x',
    display_order: 0,
    is_published: true,
  });

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('comparison_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      id: '',
      category: '',
      our_way_title: '',
      our_way_description: '',
      our_way_icon: 'check',
      other_way_title: '',
      other_way_description: '',
      other_way_icon: 'x',
      display_order: items.length + 1,
      is_published: true,
    });
    setIsEditing(false);
  };

  const openDialog = (item?: ComparisonItem) => {
    if (item) {
      setFormData(item);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.category.trim() || !formData.our_way_title.trim()) {
      toast({ title: "Error", description: "Kategori dan judul cara kami harus diisi", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('comparison_items')
          .update({
            category: formData.category,
            our_way_title: formData.our_way_title,
            our_way_description: formData.our_way_description,
            our_way_icon: formData.our_way_icon,
            other_way_title: formData.other_way_title,
            other_way_description: formData.other_way_description,
            other_way_icon: formData.other_way_icon,
            display_order: formData.display_order,
            is_published: formData.is_published,
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast({ title: "Berhasil", description: "Perbandingan berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('comparison_items')
          .insert({
            category: formData.category,
            our_way_title: formData.our_way_title,
            our_way_description: formData.our_way_description,
            our_way_icon: formData.our_way_icon,
            other_way_title: formData.other_way_title,
            other_way_description: formData.other_way_description,
            other_way_icon: formData.other_way_icon,
            display_order: formData.display_order,
            is_published: formData.is_published,
          });

        if (error) throw error;
        toast({ title: "Berhasil", description: "Perbandingan berhasil ditambahkan" });
      }

      setDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

    const { error } = await supabase.from('comparison_items').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Item berhasil dihapus" });
      fetchItems();
    }
  };

  return (
    <div className="flex-1 p-8">
      <AdminHeader 
        title="Kelola Perbandingan" 
        description="Kelola kartu perbandingan di section Kenapa Kami"
      />

      <div className="mb-6">
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Perbandingan
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Belum ada data perbandingan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl border bg-card"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    #{item.display_order}
                  </span>
                  <span className="font-semibold">{item.category}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded bg-primary/10">
                  <p className="font-medium text-primary">🚶 {item.our_way_title}</p>
                  <p className="text-muted-foreground text-xs">{item.our_way_description}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="font-medium text-muted-foreground">🚌 {item.other_way_title}</p>
                  <p className="text-muted-foreground text-xs">{item.other_way_description}</p>
                </div>
              </div>
              {!item.is_published && (
                <span className="text-xs text-muted-foreground mt-2 inline-block">Draft</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Perbandingan' : 'Tambah Perbandingan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kategori</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="contoh: Experience, Transport"
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
            </div>

            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
              <h4 className="font-semibold mb-3 text-primary">🚶 Cara Kami</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Judul</Label>
                    <Input
                      value={formData.our_way_title}
                      onChange={(e) => setFormData({ ...formData, our_way_title: e.target.value })}
                      placeholder="contoh: Local Experience"
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <Select
                      value={formData.our_way_icon}
                      onValueChange={(value) => setFormData({ ...formData, our_way_icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={formData.our_way_description}
                    onChange={(e) => setFormData({ ...formData, our_way_description: e.target.value })}
                    placeholder="Deskripsi cara kami"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-muted/30">
              <h4 className="font-semibold mb-3 text-muted-foreground">🚌 Cara Lama</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Judul</Label>
                    <Input
                      value={formData.other_way_title}
                      onChange={(e) => setFormData({ ...formData, other_way_title: e.target.value })}
                      placeholder="contoh: Tourist Trap"
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <Select
                      value={formData.other_way_icon}
                      onValueChange={(value) => setFormData({ ...formData, other_way_icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={formData.other_way_description}
                    onChange={(e) => setFormData({ ...formData, other_way_description: e.target.value })}
                    placeholder="Deskripsi cara lama"
                    rows={2}
                  />
                </div>
              </div>
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

export default ComparisonAdmin;
