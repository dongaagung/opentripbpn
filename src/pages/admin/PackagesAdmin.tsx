import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, X, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TripPackage {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  price: number;
  description: string | null;
  highlights: string[];
  cover_image_url: string | null;
  available_seats: number;
  start_date: string | null;
  is_active: boolean;
}

export default function PackagesAdmin() {
  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TripPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    duration_days: 5,
    price: 0,
    description: '',
    highlights: '',
    cover_image_url: '',
    available_seats: 20,
    start_date: '',
    is_active: true,
  });

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data paket',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      destination: '',
      duration_days: 5,
      price: 0,
      description: '',
      highlights: '',
      cover_image_url: '',
      available_seats: 20,
      start_date: '',
      is_active: true,
    });
    setEditingPackage(null);
  };

  const openDialog = (pkg?: TripPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        title: pkg.title,
        destination: pkg.destination,
        duration_days: pkg.duration_days,
        price: pkg.price,
        description: pkg.description || '',
        highlights: pkg.highlights?.join('\n') || '',
        cover_image_url: pkg.cover_image_url || '',
        available_seats: pkg.available_seats,
        start_date: pkg.start_date || '',
        is_active: pkg.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `packages/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setFormData({ ...formData, cover_image_url: publicUrl });
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diupload',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupload gambar',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const packageData = {
        title: formData.title,
        destination: formData.destination,
        duration_days: formData.duration_days,
        price: formData.price,
        description: formData.description || null,
        highlights: formData.highlights.split('\n').filter(h => h.trim()),
        cover_image_url: formData.cover_image_url || null,
        available_seats: formData.available_seats,
        start_date: formData.start_date || null,
        is_active: formData.is_active,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('trip_packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Paket berhasil diupdate' });
      } else {
        const { error } = await supabase
          .from('trip_packages')
          .insert(packageData);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Paket berhasil ditambahkan' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan paket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;

    try {
      const { error } = await supabase
        .from('trip_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Paket berhasil dihapus' });
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus paket',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <AdminHeader 
        title="Kelola Paket Trip" 
        subtitle="Tambah, edit, atau hapus paket perjalanan" 
      />

      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus size={18} />
            Tambah Paket
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada paket trip. Klik tombol "Tambah Paket" untuk membuat paket baru.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden"
              >
                {pkg.cover_image_url && (
                  <img
                    src={pkg.cover_image_url}
                    alt={pkg.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{pkg.title}</h3>
                      <p className="text-sm text-muted-foreground">{pkg.destination}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        pkg.is_active
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-primary mb-2">
                    {formatPrice(pkg.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pkg.duration_days} Hari • {pkg.available_seats} Seat
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(pkg)}
                      className="flex-1"
                    >
                      <Pencil size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pkg.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Edit Paket Trip' : 'Tambah Paket Trip'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nama Paket</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tokyo Explorer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destinasi</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Tokyo, Japan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Hari)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga (IDR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Seat Tersedia</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.available_seats}
                  onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Keberangkatan</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi paket trip..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlights">Highlight (satu per baris)</Label>
              <Textarea
                id="highlights"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                placeholder="Kunjungan ke Tokyo Skytree&#10;Wisata kuliner di Tsukiji Market&#10;..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-4">
                {formData.cover_image_url && (
                  <img
                    src={formData.cover_image_url}
                    alt="Cover"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Label
                    htmlFor="cover-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    {uploading ? 'Uploading...' : 'Upload Gambar'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Aktifkan Paket</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPackage ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
