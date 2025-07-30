import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Edit, LogOut } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  studierigting: string | null;
  posisie_hk_sr: string | null;
  created_at: string;
  updated_at: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    studierigting: '',
    posisieHkSr: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          toast("Fout: Kon nie profiel laai nie");
        } else {
          setProfile(data);
          setEditForm({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            studierigting: data.studierigting || '',
            posisieHkSr: data.posisie_hk_sr || ''
          });
        }
      }
    } catch (error) {
      toast("Fout: Kon nie profiel laai nie");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: editForm.firstName,
            last_name: editForm.lastName,
            studierigting: editForm.studierigting,
            posisie_hk_sr: editForm.posisieHkSr
          })
          .eq('user_id', user.id);

        if (error) {
          toast("Fout: Kon nie profiel opdateer nie");
        } else {
          toast("Sukses: Profiel opdateer!");
          setIsEditing(false);
          fetchProfile();
        }
      }
    } catch (error) {
      toast("Fout: Kon nie profiel opdateer nie");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast("Fout: Kon nie afmeld nie");
    } else {
      toast("Sukses: Afgemeld!");
      navigate('/auth');
    }
  };

  if (!profile) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laai profiel...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {profile.first_name} {profile.last_name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{profile.email}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Studierigting</Label>
            <div className="mt-1">
              {profile.studierigting ? (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  🎓 {profile.studierigting}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Posisie op HK/SR</Label>
            <div className="mt-1">
              {profile.posisie_hk_sr ? (
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  👥 {profile.posisie_hk_sr}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 hover:bg-primary/10">
                <Edit className="w-4 h-4 mr-2" />
                Redigeer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Redigeer Profiel</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-first-name">Voornaam</Label>
                    <Input
                      id="edit-first-name"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-last-name">Van</Label>
                    <Input
                      id="edit-last-name"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-studierigting">Studierigting</Label>
                  <Input
                    id="edit-studierigting"
                    value={editForm.studierigting}
                    onChange={(e) => setEditForm({ ...editForm, studierigting: e.target.value })}
                    placeholder="Bv. B.Sc Landbou, B.Com, B.A"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-posisie">Posisie op HK/SR</Label>
                  <Input
                    id="edit-posisie"
                    value={editForm.posisieHkSr}
                    onChange={(e) => setEditForm({ ...editForm, posisieHkSr: e.target.value })}
                    placeholder="Bv. HK Voorsitter, SR Lid, Geen"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Stoor...' : 'Stoor'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Kanselleer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Meld Af
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;