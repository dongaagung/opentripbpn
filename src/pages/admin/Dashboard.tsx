import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Package, Image, MessageSquare, Users } from 'lucide-react';

interface Stats {
  packages: number;
  gallery: number;
  testimonials: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ packages: 0, gallery: 0, testimonials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [packagesRes, galleryRes, testimonialsRes] = await Promise.all([
          supabase.from('trip_packages').select('id', { count: 'exact', head: true }),
          supabase.from('gallery').select('id', { count: 'exact', head: true }),
          supabase.from('testimonials').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          packages: packagesRes.count || 0,
          gallery: galleryRes.count || 0,
          testimonials: testimonialsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Paket Trip',
      value: stats.packages,
      icon: Package,
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      title: 'Item Galeri',
      value: stats.gallery,
      icon: Image,
      color: 'bg-green-500/20 text-green-500',
    },
    {
      title: 'Testimoni',
      value: stats.testimonials,
      icon: MessageSquare,
      color: 'bg-purple-500/20 text-purple-500',
    },
  ];

  return (
    <div>
      <AdminHeader 
        title="Dashboard" 
        subtitle="Selamat datang di Admin Panel opentrip.bpn" 
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-xl border border-border/50 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Panduan Admin</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>• <strong>Paket Trip:</strong> Kelola paket perjalanan ke Jepang (tambah, edit, hapus)</p>
            <p>• <strong>Galeri:</strong> Upload foto dan video dari trip sebelumnya</p>
            <p>• <strong>Testimoni:</strong> Kelola testimoni dari customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
