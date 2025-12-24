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
import { Plus, Edit, Trash2, Upload } from "lucide-react";

interface TripLeader {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  experience_years: number;
  trips_led: number;
  languages: string[];
  specialties: string[];
  philosophy: string | null;
  is_primary: boolean;
  is_active: boolean;
}

const TripLeaderAdmin = () => {
  const [leaders, setLeaders] = useState<TripLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    experience_years: 0,
    trips_led: 0,
    languages: '',
    specialties: '',
    philosophy: '',
    is_primary: false,
    is_active: true,
  });

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from('trip_leaders')
      .select('*')
      .order('is_primary', { ascending: false });

    if (!error && data) {
      setLeaders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      role: '',
      bio: '',
      photo_url: '',
      experience_years: 0,
      trips_led: 0,
      languages: '',
      specialties: '',
      philosophy: '',
      is_primary: false,
      is_active: true,
    });
    setIsEditing(false);
  };

  const openDialog = (leader?: TripLeader) => {
    if (leader) {
      setFormData({
        ...leader,
        photo_url: leader.photo_url || '',
        philosophy: leader.philosophy || '',
        languages: leader.languages.join(', '),
        specialties: leader.specialties.join(', '),
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `trip-leader-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
      setFormData({ ...formData, photo_url: urlData.publicUrl });
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.role.trim() || !formData.bio.trim()) {
      toast({ title: "Error", description: "Nama, role, dan bio harus diisi", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name,
      role: formData.role,
      bio: formData.bio,
      photo_url: formData.photo_url || null,
      experience_years: formData.experience_years,
      trips_led: formData.trips_led,
      languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
      philosophy: formData.philosophy || null,
      is_primary: formData.is_primary,
      is_active: formData.is_active,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('trip_leaders')
          .update(payload)
          .eq('id', formData.id);

        if (error) throw error;
        toast({ title: "Berhasil", description: "Trip leader berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('trip_leaders')
          .insert(payload);

        if (error) throw error;
        toast({ title: "Berhasil", description: "Trip leader berhasil ditambahkan" });
      }

      setDialogOpen(false);
      fetchLeaders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus trip leader ini?')) return;

    const { error } = await supabase.from('trip_leaders').delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Trip leader berhasil dihapus" });
      fetchLeaders();
    }
  };

  return (
    <div className="flex-1 p-8">
      <AdminHeader 
        title="Kelola Trip Leader" 
        subtitle="Kelola profil trip leader yang ditampilkan di website"
      />

      <div className="mb-6">
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Trip Leader
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : leaders.length === 0 ? (
        <p className="text-muted-foreground">Belum ada trip leader.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaders.map((leader) => (
            <div 
              key={leader.id} 
              className="p-4 rounded-xl border bg-card flex gap-4"
            >
              {leader.photo_url && (
                <img 
                  src={leader.photo_url} 
                  alt={leader.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{leader.name}</h3>
                  {leader.is_primary && (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Primary</span>
                  )}
                  {!leader.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{leader.role}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{leader.experience_years}+ tahun</span>
                  <span>•</span>
                  <span>{leader.trips_led} trips</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" onClick={() => openDialog(leader)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(leader.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Trip Leader' : 'Tambah Trip Leader'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {formData.photo_url && (
                <img 
                  src={formData.photo_url} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <Label>Foto</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
                {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="contoh: Founder & Lead Trip Leader"
                />
              </div>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Ceritakan tentang trip leader ini"
                rows={4}
              />
            </div>

            <div>
              <Label>Filosofi / Quote</Label>
              <Textarea
                value={formData.philosophy}
                onChange={(e) => setFormData({ ...formData, philosophy: e.target.value })}
                placeholder="Quote atau filosofi pribadi"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pengalaman (tahun)</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Jumlah Trip</Label>
                <Input
                  type="number"
                  value={formData.trips_led}
                  onChange={(e) => setFormData({ ...formData, trips_led: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Bahasa (pisahkan dengan koma)</Label>
              <Input
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="Indonesia, Jepang, Inggris"
              />
            </div>

            <div>
              <Label>Spesialisasi (pisahkan dengan koma)</Label>
              <Input
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="Hidden Gems, Street Food, Culture"
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
                <Label>Primary (ditampilkan di homepage)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Aktif</Label>
              </div>
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

export default TripLeaderAdmin;
