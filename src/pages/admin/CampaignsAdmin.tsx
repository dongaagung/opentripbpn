import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Zap, Users, Gift, Sparkles, Clock } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  title: string;
  description: string | null;
  copywriting: string | null;
  discount_type: string | null;
  discount_value: number | null;
  min_participants: number | null;
  max_participants: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  priority: number;
  badge_text: string | null;
  badge_color: string | null;
}

interface TrustProof {
  id: string;
  proof_type: string;
  label: string;
  value: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

const campaignTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flash: Zap,
  group_deal: Users,
  referral: Gift,
  seasonal: Sparkles,
  addon: Gift,
};

const CampaignsAdmin = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trustProofs, setTrustProofs] = useState<TrustProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trustDialogOpen, setTrustDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingTrustProof, setEditingTrustProof] = useState<TrustProof | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    campaign_type: "flash",
    title: "",
    description: "",
    copywriting: "",
    discount_type: "percentage",
    discount_value: 0,
    min_participants: 1,
    max_participants: 0,
    start_date: "",
    end_date: "",
    is_active: true,
    priority: 0,
    badge_text: "",
    badge_color: "primary",
  });
  
  const [trustFormData, setTrustFormData] = useState({
    proof_type: "custom",
    label: "",
    value: "",
    icon: "Check",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCampaigns();
    fetchTrustProofs();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("priority", { ascending: false });
      
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Gagal memuat campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrustProofs = async () => {
    try {
      const { data, error } = await supabase
        .from("trust_proofs")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      setTrustProofs(data || []);
    } catch (error) {
      console.error("Error fetching trust proofs:", error);
    }
  };

  const openCampaignDialog = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        campaign_type: campaign.campaign_type,
        title: campaign.title,
        description: campaign.description || "",
        copywriting: campaign.copywriting || "",
        discount_type: campaign.discount_type || "percentage",
        discount_value: campaign.discount_value || 0,
        min_participants: campaign.min_participants || 1,
        max_participants: campaign.max_participants || 0,
        start_date: campaign.start_date?.slice(0, 16) || "",
        end_date: campaign.end_date?.slice(0, 16) || "",
        is_active: campaign.is_active,
        priority: campaign.priority,
        badge_text: campaign.badge_text || "",
        badge_color: campaign.badge_color || "primary",
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: "",
        campaign_type: "flash",
        title: "",
        description: "",
        copywriting: "",
        discount_type: "percentage",
        discount_value: 0,
        min_participants: 1,
        max_participants: 0,
        start_date: "",
        end_date: "",
        is_active: true,
        priority: 0,
        badge_text: "",
        badge_color: "primary",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmitCampaign = async () => {
    try {
      const payload = {
        name: formData.name,
        campaign_type: formData.campaign_type,
        title: formData.title,
        description: formData.description || null,
        copywriting: formData.copywriting || null,
        discount_type: formData.discount_type || null,
        discount_value: formData.discount_value || null,
        min_participants: formData.min_participants,
        max_participants: formData.max_participants || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        priority: formData.priority,
        badge_text: formData.badge_text || null,
        badge_color: formData.badge_color,
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from("campaigns")
          .update(payload)
          .eq("id", editingCampaign.id);
        
        if (error) throw error;
        toast.success("Campaign berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("campaigns")
          .insert(payload);
        
        if (error) throw error;
        toast.success("Campaign berhasil ditambahkan");
      }

      setDialogOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Gagal menyimpan campaign");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Yakin ingin menghapus campaign ini?")) return;
    
    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Campaign berhasil dihapus");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Gagal menghapus campaign");
    }
  };

  const openTrustDialog = (proof?: TrustProof) => {
    if (proof) {
      setEditingTrustProof(proof);
      setTrustFormData({
        proof_type: proof.proof_type,
        label: proof.label,
        value: proof.value,
        icon: proof.icon || "Check",
        display_order: proof.display_order,
        is_active: proof.is_active,
      });
    } else {
      setEditingTrustProof(null);
      setTrustFormData({
        proof_type: "custom",
        label: "",
        value: "",
        icon: "Check",
        display_order: 0,
        is_active: true,
      });
    }
    setTrustDialogOpen(true);
  };

  const handleSubmitTrustProof = async () => {
    try {
      const payload = {
        proof_type: trustFormData.proof_type,
        label: trustFormData.label,
        value: trustFormData.value,
        icon: trustFormData.icon,
        display_order: trustFormData.display_order,
        is_active: trustFormData.is_active,
      };

      if (editingTrustProof) {
        const { error } = await supabase
          .from("trust_proofs")
          .update(payload)
          .eq("id", editingTrustProof.id);
        
        if (error) throw error;
        toast.success("Trust proof berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from("trust_proofs")
          .insert(payload);
        
        if (error) throw error;
        toast.success("Trust proof berhasil ditambahkan");
      }

      setTrustDialogOpen(false);
      fetchTrustProofs();
    } catch (error) {
      console.error("Error saving trust proof:", error);
      toast.error("Gagal menyimpan trust proof");
    }
  };

  const handleDeleteTrustProof = async (id: string) => {
    if (!confirm("Yakin ingin menghapus trust proof ini?")) return;
    
    try {
      const { error } = await supabase
        .from("trust_proofs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Trust proof berhasil dihapus");
      fetchTrustProofs();
    } catch (error) {
      console.error("Error deleting trust proof:", error);
      toast.error("Gagal menghapus trust proof");
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      flash: "Flash Sale",
      group_deal: "Group Deal",
      referral: "Referral",
      seasonal: "Seasonal",
      addon: "Add-on",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Campaigns & Trust Proofs" 
        description="Kelola marketing campaigns dan trust badges"
      />

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="trust">Trust Proofs</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCampaignDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Campaign
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada campaign. Klik tombol di atas untuk menambahkan.
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => {
                const Icon = campaignTypeIcons[campaign.campaign_type] || Sparkles;
                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            campaign.is_active ? "bg-primary/10" : "bg-muted"
                          }`}>
                            <Icon className={`w-6 h-6 ${campaign.is_active ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{campaign.title}</h3>
                              <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                {getCampaignTypeLabel(campaign.campaign_type)}
                              </span>
                              {!campaign.is_active && (
                                <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{campaign.copywriting || campaign.description}</p>
                            {campaign.discount_value && (
                              <p className="text-sm font-medium text-primary mt-1">
                                Diskon: {campaign.discount_type === "percentage" ? `${campaign.discount_value}%` : `IDR ${campaign.discount_value.toLocaleString("id-ID")}`}
                              </p>
                            )}
                            {campaign.end_date && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Berakhir: {new Date(campaign.end_date).toLocaleDateString("id-ID")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => openCampaignDialog(campaign)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trust" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openTrustDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Trust Proof
            </Button>
          </div>

          {trustProofs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada trust proof. Klik tombol di atas untuk menambahkan.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trustProofs.map((proof) => (
                <Card key={proof.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{proof.value}</p>
                        <p className="text-sm text-muted-foreground">{proof.label}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openTrustDialog(proof)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteTrustProof(proof.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit Campaign" : "Tambah Campaign"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Campaign</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Flash Sale"
                />
              </div>
              <div>
                <Label>Tipe Campaign</Label>
                <Select value={formData.campaign_type} onValueChange={(v) => setFormData({ ...formData, campaign_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flash">Flash Sale</SelectItem>
                    <SelectItem value="group_deal">Group Deal</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="addon">Add-on Experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Judul</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Flash Japan Deal!"
              />
            </div>

            <div>
              <Label>Copywriting</Label>
              <Textarea
                value={formData.copywriting}
                onChange={(e) => setFormData({ ...formData, copywriting: e.target.value })}
                placeholder="Hanya weekend ini! Diskon spesial untuk trip impianmu ke Jepang"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipe Diskon</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (IDR)</SelectItem>
                    <SelectItem value="addon">Add-on Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nilai Diskon</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mulai</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Berakhir</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Badge Text</Label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="🔥 HOT DEAL"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmitCampaign}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trust Proof Dialog */}
      <Dialog open={trustDialogOpen} onOpenChange={setTrustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrustProof ? "Edit Trust Proof" : "Tambah Trust Proof"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tipe</Label>
              <Select value={trustFormData.proof_type} onValueChange={(v) => setTrustFormData({ ...trustFormData, proof_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trip_count">Total Trip</SelectItem>
                  <SelectItem value="repeat_customer">Repeat Customer</SelectItem>
                  <SelectItem value="zero_cancelled">Zero Cancelled</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Value (Angka/Teks)</Label>
              <Input
                value={trustFormData.value}
                onChange={(e) => setTrustFormData({ ...trustFormData, value: e.target.value })}
                placeholder="27+"
              />
            </div>

            <div>
              <Label>Label</Label>
              <Input
                value={trustFormData.label}
                onChange={(e) => setTrustFormData({ ...trustFormData, label: e.target.value })}
                placeholder="Total Trip"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select value={trustFormData.icon} onValueChange={(v) => setTrustFormData({ ...trustFormData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Map">Map</SelectItem>
                    <SelectItem value="Users">Users</SelectItem>
                    <SelectItem value="Shield">Shield</SelectItem>
                    <SelectItem value="Award">Award</SelectItem>
                    <SelectItem value="Star">Star</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={trustFormData.display_order}
                  onChange={(e) => setTrustFormData({ ...trustFormData, display_order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={trustFormData.is_active}
                onCheckedChange={(checked) => setTrustFormData({ ...trustFormData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrustDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmitTrustProof}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsAdmin;
