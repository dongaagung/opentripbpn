import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Star, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  rating: number;
  testimonial_text: string;
  trip_destination: string | null;
  is_published: boolean;
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_photo_url: '',
    rating: 5,
    testimonial_text: '',
    trip_destination: '',
    is_published: true,
  });

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data testimoni',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_photo_url: '',
      rating: 5,
      testimonial_text: '',
      trip_destination: '',
      is_published: true,
    });
    setEditingTestimonial(null);
  };

  const openDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        customer_name: testimonial.customer_name,
        customer_photo_url: testimonial.customer_photo_url || '',
        rating: testimonial.rating,
        testimonial_text: testimonial.testimonial_text,
        trip_destination: testimonial.trip_destination || '',
        is_published: testimonial.is_published,
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
      const fileName = `testimonials/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setFormData({ ...formData, customer_photo_url: publicUrl });
      toast({
        title: 'Berhasil',
        description: 'Foto berhasil diupload',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupload foto',
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
      const testimonialData = {
        customer_name: formData.customer_name,
        customer_photo_url: formData.customer_photo_url || null,
        rating: formData.rating,
        testimonial_text: formData.testimonial_text,
        trip_destination: formData.trip_destination || null,
        is_published: formData.is_published,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Testimoni berhasil diupdate' });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Testimoni berhasil ditambahkan' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan testimoni',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Testimoni berhasil dihapus' });
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus testimoni',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <AdminHeader 
        title="Kelola Testimoni" 
        subtitle="Tambah dan kelola testimoni customer" 
      />

      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus size={18} />
            Tambah Testimoni
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada testimoni. Klik tombol "Tambah Testimoni" untuk menambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 p-5"
              >
                <div className="flex items-start gap-4 mb-4">
                  {testimonial.customer_photo_url ? (
                    <img
                      src={testimonial.customer_photo_url}
                      alt={testimonial.customer_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {testimonial.customer_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{testimonial.customer_name}</h3>
                    {testimonial.trip_destination && (
                      <p className="text-sm text-muted-foreground">{testimonial.trip_destination}</p>
                    )}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < testimonial.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      testimonial.is_published
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {testimonial.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  "{testimonial.testimonial_text}"
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDialog(testimonial)}
                    className="flex-1"
                  >
                    <Pencil size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {formData.customer_photo_url ? (
                <img
                  src={formData.customer_photo_url}
                  alt="Customer"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xl text-muted-foreground">
                    {formData.customer_name.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span className="flex items-center gap-2">
                      {uploading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Foto'}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name">Nama Customer</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Nama customer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trip_destination">Destinasi Trip</Label>
              <Input
                id="trip_destination"
                value={formData.trip_destination}
                onChange={(e) => setFormData({ ...formData, trip_destination: e.target.value })}
                placeholder="Tokyo, Japan"
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={
                        star <= formData.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground hover:text-yellow-500'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testimonial_text">Testimoni</Label>
              <Textarea
                id="testimonial_text"
                value={formData.testimonial_text}
                onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                placeholder="Tuliskan testimoni customer..."
                rows={4}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published">Publish</Label>
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
                {editingTestimonial ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
