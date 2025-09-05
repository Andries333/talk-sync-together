import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Edit, LogOut, CalendarIcon, AlertTriangle, Phone, MapPin, GraduationCap } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  studierigting: string | null;
  posisie_hk_sr: string | null;
  posisie: string | null;
  koshuis: string | null;
  verjaarsdag: string | null;
  telefoonnommer: string | null;
  profile_completion_count: number;
  created_at: string;
  updated_at: string;
  afdeling?: string | null;
  afdelingsposisie?: string | null;
  is_koshuisvoog?: boolean | null;
  koshuisvoog_koshuis?: string | null;
}

const POSISIE_OPTIONS = [
  { value: 'HK', label: '🏛️ HK (Huiskomitee)' },
  { value: 'SR', label: '👥 SR (Studenteraad)' },
  { value: 'Personeel', label: '👨‍💼 Personeel' },
];

const STUDIERIGTING_OPTIONS = [
  { value: 'Boerdery bestuur', label: '🚜 Boerdery bestuur' },
  { value: 'Bou en siviel', label: '🏗️ Bou en siviel' },
  { value: 'Loodgieter', label: '🔧 Loodgieter' },
  { value: 'Elektries', label: '⚡ Elektries' },
  { value: 'Vroeë kinderontwikkeling', label: '👶 Vroeë kinderontwikkeling' },
  { value: 'Tuisversorging', label: '🏠 Tuisversorging' },
];

const KOSHUIS_OPTIONS = [
  { value: 'Heldehuis', label: '🏛️ Heldehuis' },
  { value: 'Vaalbos', label: '🌳 Vaalbos' },
  { value: 'Duiker', label: '🦌 Duiker' },
  { value: 'Steenbok', label: '🐐 Steenbok' },
];

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    studierigting: '',
    posisieHkSr: '',
    posisie: '',
    koshuis: '',
    telefoonnommer: '',
    afdeling: '',
    afdelingsposisie: '',
    isKoshuisvoog: false,
    koshuisvoogKoshuis: '',
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
            posisieHkSr: data.posisie_hk_sr || '',
            posisie: data.posisie || '',
            koshuis: data.koshuis || '',
            telefoonnommer: data.telefoonnommer || '',
            afdeling: (data as any).afdeling || '',
            afdelingsposisie: (data as any).afdelingsposisie || '',
            isKoshuisvoog: (data as any).is_koshuisvoog || false,
            koshuisvoogKoshuis: (data as any).koshuisvoog_koshuis || '',
          });
          
          if (data.verjaarsdag) {
            setSelectedDate(new Date(data.verjaarsdag));
          }
        }
      }
    } catch (error) {
      toast("Fout: Kon nie profiel laai nie");
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = [
      profile.first_name,
      profile.last_name,
      profile.posisie,
      profile.koshuis,
      profile.verjaarsdag,
      profile.telefoonnommer
    ];
    
    // If position is not "Personeel", studierigting is also required
    if (profile.posisie !== 'Personeel') {
      requiredFields.push(profile.studierigting);
    }
    
    return requiredFields.every(field => field && field.trim() !== '');
  };

  const shouldBlockAccess = () => {
    return profile && profile.profile_completion_count >= 5 && !isProfileComplete();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const updateData: any = {
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          posisie_hk_sr: editForm.posisieHkSr,
          posisie: editForm.posisie,
          koshuis: editForm.koshuis,
          telefoonnommer: editForm.telefoonnommer,
        };

        // Only include studierigting if position is not "Personeel"
        if (editForm.posisie !== 'Personeel') {
          updateData.studierigting = editForm.studierigting;
        } else {
          updateData.studierigting = null;
        }

        // Include birthday if selected
        if (selectedDate) {
          updateData.verjaarsdag = format(selectedDate, 'yyyy-MM-dd');
        }

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
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

  // Vereis personeel wagwoord wanneer 'Personeel' gekies word
  const handlePositionChange = (value: string) => {
    if (value === 'Personeel') {
      const pwd = window.prompt('Voer Personeel-wagwoord in:');
      if (pwd === 'BoKaroo123') {
        setEditForm({ ...editForm, posisie: value });
        toast('Sukses: Personeel bevestig');
      } else {
        toast('Fout: Verkeerde Personeel-wagwoord');
        return;
      }
    } else {
      setEditForm({ ...editForm, posisie: value });
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
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Warning Alert for Incomplete Profile */}
      {!isProfileComplete() && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            Jou profiel is nie volledig nie. 
            {profile.profile_completion_count >= 5 ? (
              <span className="font-bold text-red-600"> Toegang tot ander funksies is beperk tot profiel voltooi is.</span>
            ) : (
              <span> Jy het nog {5 - profile.profile_completion_count} pogings oor om dit te voltooi.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
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
          <div className="grid md:grid-cols-2 gap-4">
            {/* Posisie */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Posisie</Label>
              <div className="mt-1">
                {profile.posisie ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {POSISIE_OPTIONS.find(p => p.value === profile.posisie)?.label || profile.posisie}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
                )}
              </div>
            </div>

            {/* Koshuis */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Koshuis</Label>
              <div className="mt-1">
                {profile.koshuis ? (
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    <MapPin className="w-3 h-3 mr-1" />
                    {KOSHUIS_OPTIONS.find(k => k.value === profile.koshuis)?.label || profile.koshuis}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
                )}
              </div>
            </div>

            {/* Studierigting - Only show if not Personeel */}
            {profile.posisie !== 'Personeel' && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Studierigting</Label>
                <div className="mt-1">
                  {profile.studierigting ? (
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {STUDIERIGTING_OPTIONS.find(s => s.value === profile.studierigting)?.label || profile.studierigting}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
                  )}
                </div>
              </div>
            )}

            {/* Telefoonnommer */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Telefoonnommer</Label>
              <div className="mt-1">
                {profile.telefoonnommer ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <Phone className="w-3 h-3 mr-1" />
                    {profile.telefoonnommer}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
                )}
              </div>
            </div>

            {/* Verjaarsdag */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Verjaarsdag</Label>
              <div className="mt-1">
                {profile.verjaarsdag ? (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {format(new Date(profile.verjaarsdag), 'dd MMMM')}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Nie gespesifiseer nie</span>
                )}
              </div>
            </div>

            {/* Ou Posisie veld (legacy) */}
            {profile.posisie_hk_sr && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Posisie op HK/SR (Ou)</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="text-muted-foreground">
                    👥 {profile.posisie_hk_sr}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 hover:bg-primary/10">
                  <Edit className="w-4 h-4 mr-2" />
                  Redigeer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Redigeer Profiel</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-first-name">Voornaam *</Label>
                      <Input
                        id="edit-first-name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-last-name">Van *</Label>
                      <Input
                        id="edit-last-name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-posisie">Posisie *</Label>
                    <Select value={editForm.posisie} onValueChange={handlePositionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kies jou posisie" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSISIE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Studierigting - Only show if not Personeel */}
                  {editForm.posisie !== 'Personeel' && (
                    <div>
                      <Label htmlFor="edit-studierigting">Studierigting *</Label>
                      <Select value={editForm.studierigting} onValueChange={(value) => setEditForm({ ...editForm, studierigting: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies jou studierigting" />
                        </SelectTrigger>
                        <SelectContent>
                          {STUDIERIGTING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="edit-koshuis">Koshuis *</Label>
                    <Select value={editForm.koshuis} onValueChange={(value) => setEditForm({ ...editForm, koshuis: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kies jou koshuis" />
                      </SelectTrigger>
                      <SelectContent>
                        {KOSHUIS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Verjaarsdag *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd MMMM yyyy") : <span>Kies verjaarsdag</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="edit-telefoonnommer">Telefoonnommer *</Label>
                    <Input
                      id="edit-telefoonnommer"
                      value={editForm.telefoonnommer}
                      onChange={(e) => setEditForm({ ...editForm, telefoonnommer: e.target.value })}
                      placeholder="Bv. 082 123 4567"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-posisie-ou">Posisie op HK/SR (Ou veld)</Label>
                    <Input
                      id="edit-posisie-ou"
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
    </div>
  );
};

export default UserProfile;