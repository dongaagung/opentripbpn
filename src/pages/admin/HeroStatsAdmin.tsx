import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

interface HeroStat {
  id: string;
  label: string;
  value: string;
  display_order: number;
  is_active: boolean;
}

const HeroStatsAdmin = () => {
  const [stats, setStats] = useState<HeroStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    label: '',
    value: '',
    display_order: 0,
    is_active: true,
  });

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('hero_stats')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setStats(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const resetForm = () => {
    setFormData({
      id: '',
      label: '',
      value: '',
      display_order: stats.length + 1,
      is_active: true,
    });
    setIsEditing(false);
  };

  const openDialog = (stat?: HeroStat) => {
    if (stat) {
      setFormData(stat);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.label.trim() || !formData.value.trim()) {
      toast({ title: "Error", description: "Label dan value harus diisi", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('hero_stats')
          .update({
            label: formData.label,
            value: formData.value,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast({ title: "Berhasil", description: "Statistik berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('hero_stats')
          .insert({
            label: formData.label,
            value: formData.value,
            display_order: formData.display_order,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast({ title: "Berhasil", description: "Statistik berhasil ditambahkan" });
      }

      setDialogOpen(false);
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus statistik ini?')) return;

    const { error } = await supabase.from('hero_stats').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Statistik berhasil dihapus" });
      fetchStats();
    }
  };

  return (
    <div className="flex-1 p-8">
      <AdminHeader 
        title="Kelola Hero Stats" 
        description="Kelola statistik yang ditampilkan di hero section"
      />

      <div className="mb-6">
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Statistik
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : stats.length === 0 ? (
        <p className="text-muted-foreground">Belum ada statistik.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className="p-6 rounded-xl border bg-card text-center"
            >
              <div className="flex justify-end gap-1 mb-2">
                <Button variant="ghost" size="icon" onClick={() => openDialog(stat)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <p className="text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  #{stat.display_order}
                </span>
                {!stat.is_active && (
                  <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Statistik' : 'Tambah Statistik'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="contoh: Peserta Happy"
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="contoh: 500+"
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
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
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

export default HeroStatsAdmin;
