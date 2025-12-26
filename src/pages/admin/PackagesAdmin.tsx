import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Upload, Calendar, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Json } from '@/integrations/supabase/types';

interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

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
  itinerary: ItineraryItem[];
  target_participants: string | null;
  inclusions: string[];
  exclusions: string[];
  meeting_point: string | null;
  departure_time: string | null;
  // Pricing tiers fields
  use_tiered_pricing: boolean;
  active_pricing_tier: 'early_bird' | 'regular' | 'last_call';
  early_bird_price: number | null;
  regular_price: number | null;
  last_call_price: number | null;
}

const parseItinerary = (data: Json | null): ItineraryItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => ({
      day: typeof item === 'object' && item !== null && 'day' in item ? Number(item.day) : 0,
      title: typeof item === 'object' && item !== null && 'title' in item ? String(item.title) : '',
      activities: typeof item === 'object' && item !== null && 'activities' in item && Array.isArray(item.activities)
        ? item.activities.map(String)
        : [],
    }));
  }
  return [];
};

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
    itinerary: '',
    target_participants: '',
    inclusions: '',
    exclusions: '',
    meeting_point: '',
    departure_time: '',
    // Pricing tiers fields
    use_tiered_pricing: false,
    active_pricing_tier: 'regular' as 'early_bird' | 'regular' | 'last_call',
    early_bird_price: null as number | null,
    regular_price: null as number | null,
    last_call_price: null as number | null,
  });

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed: TripPackage[] = (data || []).map((pkg) => ({
        ...pkg,
        itinerary: parseItinerary(pkg.itinerary),
        highlights: pkg.highlights || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
      }));
      setPackages(parsed);
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
      itinerary: '',
      target_participants: '',
      inclusions: '',
      exclusions: '',
      meeting_point: '',
      departure_time: '',
      use_tiered_pricing: false,
      active_pricing_tier: 'regular',
      early_bird_price: null,
      regular_price: null,
      last_call_price: null,
    });
    setEditingPackage(null);
  };

  const itineraryToString = (itinerary: ItineraryItem[]): string => {
    return itinerary.map(item => {
      const activities = item.activities.join('; ');
      return `Hari ${item.day}: ${item.title}\n${activities}`;
    }).join('\n\n');
  };

  const stringToItinerary = (str: string): ItineraryItem[] => {
    if (!str.trim()) return [];
    const days = str.split(/\n\n+/).filter(d => d.trim());
    return days.map((dayBlock, idx) => {
      const lines = dayBlock.split('\n').filter(l => l.trim());
      const headerMatch = lines[0]?.match(/^Hari\s*(\d+)\s*:\s*(.+)$/i);
      const day = headerMatch ? parseInt(headerMatch[1]) : idx + 1;
      const title = headerMatch ? headerMatch[2].trim() : lines[0] || '';
      const activities = headerMatch 
        ? lines.slice(1).flatMap(l => l.split(';').map(a => a.trim()).filter(Boolean))
        : lines.slice(1).flatMap(l => l.split(';').map(a => a.trim()).filter(Boolean));
      return { day, title, activities };
    });
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
        itinerary: itineraryToString(pkg.itinerary),
        target_participants: pkg.target_participants || '',
        inclusions: pkg.inclusions?.join('\n') || '',
        exclusions: pkg.exclusions?.join('\n') || '',
        meeting_point: pkg.meeting_point || '',
        departure_time: pkg.departure_time || '',
        use_tiered_pricing: pkg.use_tiered_pricing || false,
        active_pricing_tier: pkg.active_pricing_tier || 'regular',
        early_bird_price: pkg.early_bird_price,
        regular_price: pkg.regular_price,
        last_call_price: pkg.last_call_price,
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
      // Convert itinerary to plain JSON-compatible objects
      const itineraryData = stringToItinerary(formData.itinerary).map(item => ({
        day: item.day,
        title: item.title,
        activities: item.activities,
      }));

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
        itinerary: itineraryData as unknown as Json,
        target_participants: formData.target_participants || null,
        inclusions: formData.inclusions.split('\n').filter(h => h.trim()),
        exclusions: formData.exclusions.split('\n').filter(h => h.trim()),
        meeting_point: formData.meeting_point || null,
        departure_time: formData.departure_time || null,
        // Pricing tiers data
        use_tiered_pricing: formData.use_tiered_pricing,
        active_pricing_tier: formData.active_pricing_tier,
        early_bird_price: formData.early_bird_price,
        regular_price: formData.regular_price,
        last_call_price: formData.last_call_price,
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
          .insert([packageData]);

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

  const getActivePrice = (pkg: TripPackage): number => {
    if (!pkg.use_tiered_pricing) return pkg.price;

    switch (pkg.active_pricing_tier) {
      case 'early_bird':
        return pkg.early_bird_price ?? pkg.regular_price ?? pkg.price;
      case 'last_call':
        return pkg.last_call_price ?? pkg.regular_price ?? pkg.price;
      case 'regular':
      default:
        return pkg.regular_price ?? pkg.price;
    }
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
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin size={12} />
                        {pkg.destination}
                      </p>
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
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(getActivePrice(pkg))}
                    </p>
                    {pkg.use_tiered_pricing && (
                      <Badge variant="secondary" className="text-xs">
                        {pkg.active_pricing_tier === 'early_bird' && '🐦 Early Bird'}
                        {pkg.active_pricing_tier === 'regular' && '💰 Regular'}
                        {pkg.active_pricing_tier === 'last_call' && '🔥 Last Call'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pkg.duration_days} Hari • {pkg.available_seats} Seat
                  </p>
                  {pkg.start_date && (
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(pkg.start_date).toLocaleDateString('id-ID')}
                    </p>
                  )}
                  {pkg.itinerary.length > 0 && (
                    <p className="text-xs text-primary mb-3">
                      {pkg.itinerary.length} hari itinerary
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Edit Paket Trip' : 'Tambah Paket Trip'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic">Info Dasar</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="details">Detail Lainnya</TabsTrigger>
                <TabsTrigger value="pricing">Harga</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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
              </TabsContent>

              <TabsContent value="itinerary" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itinerary">Itinerary</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Format: "Hari 1: Judul" diikuti aktivitas (pisahkan dengan titik koma atau baris baru).
                    Pisahkan hari dengan baris kosong.
                  </p>
                  <Textarea
                    id="itinerary"
                    value={formData.itinerary}
                    onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                    placeholder={`Hari 1: Kedatangan di Tokyo\nPenjemputan di bandara Narita; Check-in hotel; Makan malam selamat datang\n\nHari 2: Eksplorasi Tokyo\nKunjungan ke Tokyo Skytree; Wisata kuliner di Asakusa; Belanja di Shibuya`}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_participants">Target Peserta</Label>
                  <Input
                    id="target_participants"
                    value={formData.target_participants}
                    onChange={(e) => setFormData({ ...formData, target_participants: e.target.value })}
                    placeholder="Cocok untuk keluarga, pasangan, solo traveler"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting_point">Meeting Point</Label>
                    <Input
                      id="meeting_point"
                      value={formData.meeting_point}
                      onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                      placeholder="Bandara Sepinggan, Balikpapan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departure_time">Waktu Keberangkatan</Label>
                    <Input
                      id="departure_time"
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inclusions">Termasuk (satu per baris)</Label>
                  <Textarea
                    id="inclusions"
                    value={formData.inclusions}
                    onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                    placeholder="Tiket pesawat PP&#10;Akomodasi hotel&#10;Transportasi selama tour&#10;Guide berbahasa Indonesia"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclusions">Tidak Termasuk (satu per baris)</Label>
                  <Textarea
                    id="exclusions"
                    value={formData.exclusions}
                    onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                    placeholder="Pengeluaran pribadi&#10;Tips untuk guide dan driver&#10;Asuransi perjalanan"
                    rows={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                {/* Toggle Tiered Pricing */}
                <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                  <Switch
                    id="use_tiered_pricing"
                    checked={formData.use_tiered_pricing}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        use_tiered_pricing: checked,
                        regular_price: checked && !formData.regular_price ? formData.price : formData.regular_price
                      });
                    }}
                  />
                  <Label htmlFor="use_tiered_pricing" className="font-semibold">
                    Gunakan Sistem Harga Bertingkat (3-Tier Pricing)
                  </Label>
                </div>

                {/* Single Price (when tiered pricing disabled) */}
                {!formData.use_tiered_pricing && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga Paket (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      min={0}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Harga tunggal untuk paket ini</p>
                  </div>
                )}

                {/* Tiered Pricing (when enabled) */}
                {formData.use_tiered_pricing && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Early Bird Price */}
                      <div className="space-y-2">
                        <Label htmlFor="early_bird_price">
                          🐦 Early Bird Price <span className="text-xs text-muted-foreground">(Opsional)</span>
                        </Label>
                        <Input
                          id="early_bird_price"
                          type="number"
                          value={formData.early_bird_price ?? ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            early_bird_price: e.target.value ? parseInt(e.target.value) : null
                          })}
                          min={0}
                          placeholder="Contoh: 3000000"
                        />
                        <p className="text-xs text-muted-foreground">Harga untuk pembeli awal</p>
                      </div>

                      {/* Regular Price */}
                      <div className="space-y-2">
                        <Label htmlFor="regular_price">
                          💰 Regular Price <span className="text-xs text-primary">(Wajib)</span>
                        </Label>
                        <Input
                          id="regular_price"
                          type="number"
                          value={formData.regular_price ?? ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            regular_price: e.target.value ? parseInt(e.target.value) : null
                          })}
                          min={0}
                          placeholder="Contoh: 3500000"
                          required={formData.use_tiered_pricing}
                        />
                        <p className="text-xs text-muted-foreground">Harga standar/normal</p>
                      </div>

                      {/* Last Call Price */}
                      <div className="space-y-2">
                        <Label htmlFor="last_call_price">
                          🔥 Last Call Price <span className="text-xs text-muted-foreground">(Opsional)</span>
                        </Label>
                        <Input
                          id="last_call_price"
                          type="number"
                          value={formData.last_call_price ?? ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            last_call_price: e.target.value ? parseInt(e.target.value) : null
                          })}
                          min={0}
                          placeholder="Contoh: 4000000"
                        />
                        <p className="text-xs text-muted-foreground">Harga menjelang deadline</p>
                      </div>
                    </div>

                    {/* Active Tier Selector */}
                    <div className="space-y-2">
                      <Label>Tier Harga yang Aktif Saat Ini</Label>
                      <RadioGroup
                        value={formData.active_pricing_tier}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          active_pricing_tier: value as 'early_bird' | 'regular' | 'last_call'
                        })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="early_bird"
                            id="tier_early_bird"
                            disabled={!formData.early_bird_price}
                          />
                          <Label htmlFor="tier_early_bird" className="cursor-pointer">🐦 Early Bird</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regular" id="tier_regular" />
                          <Label htmlFor="tier_regular" className="cursor-pointer">💰 Regular</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="last_call"
                            id="tier_last_call"
                            disabled={!formData.last_call_price}
                          />
                          <Label htmlFor="tier_last_call" className="cursor-pointer">🔥 Last Call</Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground">
                        Customer akan melihat harga dari tier yang aktif
                      </p>
                    </div>

                    {/* Pricing Preview */}
                    <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                      <p className="font-semibold text-sm">Preview Harga:</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className={formData.active_pricing_tier === 'early_bird' ? 'font-bold text-primary' : ''}>
                          Early Bird: {formData.early_bird_price ? formatPrice(formData.early_bird_price) : '-'}
                        </div>
                        <div className={formData.active_pricing_tier === 'regular' ? 'font-bold text-primary' : ''}>
                          Regular: {formData.regular_price ? formatPrice(formData.regular_price) : '-'}
                        </div>
                        <div className={formData.active_pricing_tier === 'last_call' ? 'font-bold text-primary' : ''}>
                          Last Call: {formData.last_call_price ? formatPrice(formData.last_call_price) : '-'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
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