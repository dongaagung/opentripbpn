import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Upload, Image, Video, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  category: string;
  tags: string[];
  display_order: number;
  is_published: boolean;
}

const CATEGORIES = ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fuji', 'General'];

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'image',
    category: 'General',
    tags: '',
    is_published: true,
  });

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data galeri',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_type: 'image',
      category: 'General',
      tags: '',
      is_published: true,
    });
    setEditingItem(null);
  };

  const openDialog = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        file_url: item.file_url,
        file_type: item.file_type,
        category: item.category,
        tags: item.tags?.join(', ') || '',
        is_published: item.is_published,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast({
        title: 'Error',
        description: 'Hanya file gambar atau video yang diperbolehkan',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setFormData({
        ...formData,
        file_url: publicUrl,
        file_type: isVideo ? 'video' : 'image',
        title: formData.title || file.name.replace(/\.[^/.]+$/, ''),
      });

      toast({
        title: 'Berhasil',
        description: 'File berhasil diupload',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengupload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [formData]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        title: formData.title,
        description: formData.description || null,
        file_url: formData.file_url,
        file_type: formData.file_type,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_published: formData.is_published,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('gallery')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Item galeri berhasil diupdate' });
      } else {
        const { error } = await supabase
          .from('gallery')
          .insert({ ...itemData, display_order: items.length });

        if (error) throw error;
        toast({ title: 'Berhasil', description: 'Item galeri berhasil ditambahkan' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan item galeri',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Berhasil', description: 'Item galeri berhasil dihapus' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus item galeri',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <AdminHeader 
        title="Kelola Galeri" 
        subtitle="Upload dan kelola foto serta video trip" 
      />

      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus size={18} />
            Tambah Media
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada item galeri. Klik tombol "Tambah Media" untuk mengupload.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden"
              >
                {item.file_type === 'video' ? (
                  <video
                    src={item.file_url}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => openDialog(item)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="absolute top-2 left-2">
                  {item.file_type === 'video' ? (
                    <span className="bg-primary/80 text-primary-foreground px-2 py-1 text-xs rounded-full flex items-center gap-1">
                      <Video size={12} />
                      Video
                    </span>
                  ) : (
                    <span className="bg-secondary/80 text-secondary-foreground px-2 py-1 text-xs rounded-full flex items-center gap-1">
                      <Image size={12} />
                      Image
                    </span>
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.is_published
                        ? 'bg-green-500/80 text-white'
                        : 'bg-red-500/80 text-white'
                    }`}
                  >
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="p-3">
                  <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
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
              {editingItem ? 'Edit Item Galeri' : 'Tambah Item Galeri'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {formData.file_url ? (
                <div className="relative inline-block">
                  {formData.file_type === 'video' ? (
                    <video
                      src={formData.file_url}
                      className="max-h-40 rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={formData.file_url}
                      alt="Preview"
                      className="max-h-40 rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={() => setFormData({ ...formData, file_url: '', file_type: 'image' })}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  )}
                  <p className="text-sm text-muted-foreground mb-2">
                    {uploading ? 'Uploading...' : 'Drag & drop file atau klik untuk upload'}
                  </p>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Pilih File</span>
                    </Button>
                  </Label>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul gambar/video"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="sakura, spring, tokyo"
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
              <Button type="submit" disabled={isSubmitting || !formData.file_url}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
