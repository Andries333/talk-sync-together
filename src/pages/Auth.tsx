import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

const Auth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studierigting: '',
    posisieHkSr: '',
    userType: 'student', // student or personeel
    afdeling: '', // Studentesake or Akademie
    afdelingsposisie: '', // Specific position under department
    isKoshuisvoog: false,
    koshuis: ''
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to main page
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast("Fout: Verkeerde email of wagwoord");
        } else {
          toast(`Fout: ${error.message}`);
        }
      } else {
        toast("Sukses: Aangemeld!");
      }
    } catch (error) {
      toast("Fout: Kon nie aanmeld nie");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast("Fout: Wagwoorde stem nie ooreen nie");
      return;
    }

    if (signupForm.password.length < 6) {
      toast("Fout: Wagwoord moet minstens 6 karakters lank wees");
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: signupForm.firstName,
            last_name: signupForm.lastName,
            studierigting: signupForm.studierigting,
            posisie_hk_sr: signupForm.posisieHkSr,
            user_type: signupForm.userType,
            afdeling: signupForm.afdeling,
            afdelingsposisie: signupForm.afdelingsposisie,
            is_koshuisvoog: signupForm.isKoshuisvoog,
            koshuis: signupForm.koshuis
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast("Fout: Hierdie email adres is reeds geregistreer");
        } else {
          toast(`Fout: ${error.message}`);
        }
      } else {
        toast("Sukses: Registrasie voltooi! Kyk jou email vir bevestiging.");
        setSignupForm({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          studierigting: '',
          posisieHkSr: '',
          userType: 'student',
          afdeling: '',
          afdelingsposisie: '',
          isKoshuisvoog: false,
          koshuis: ''
        });
      }
    } catch (error) {
      toast("Fout: Kon nie registreer nie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🎓 BKO Studentesake
          </CardTitle>
          <p className="text-muted-foreground">Welkom by die admin sisteem van BKO Leiers en Studentesake Personeel.</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Aanmeld</TabsTrigger>
              <TabsTrigger value="signup">Registreer</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="jou.email@student.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Wagwoord</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Meld aan...' : '🔑 Meld Aan'}
                </Button>
              </form>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first-name">Voornaam *</Label>
                    <Input
                      id="first-name"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      placeholder="Piet"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Van *</Label>
                    <Input
                      id="last-name"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      placeholder="Pompies"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="user-type">Ek is 'n *</Label>
                  <Select 
                    value={signupForm.userType} 
                    onValueChange={(value) => setSignupForm({ 
                      ...signupForm, 
                      userType: value,
                      afdeling: '',
                      afdelingsposisie: '',
                      isKoshuisvoog: false,
                      koshuis: ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kies gebruiker tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="personeel">Personeellid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="jou.email@student.com"
                    required
                  />
                </div>
                
                {signupForm.userType === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="studierigting">Studierigting</Label>
                      <Input
                        id="studierigting"
                        value={signupForm.studierigting}
                        onChange={(e) => setSignupForm({ ...signupForm, studierigting: e.target.value })}
                        placeholder="Bv. B.Sc Landbou, B.Com, B.A"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="posisie">Posisie op HK/SR</Label>
                      <Input
                        id="posisie"
                        value={signupForm.posisieHkSr}
                        onChange={(e) => setSignupForm({ ...signupForm, posisieHkSr: e.target.value })}
                        placeholder="Bv. HK Voorsitter, SR Lid, Geen"
                      />
                    </div>
                  </>
                )}

                {signupForm.userType === 'personeel' && (
                  <>
                    <div>
                      <Label htmlFor="afdeling">Afdeling *</Label>
                      <Select 
                        value={signupForm.afdeling} 
                        onValueChange={(value) => setSignupForm({ 
                          ...signupForm, 
                          afdeling: value,
                          afdelingsposisie: ''
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kies afdeling" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Studentesake">Studentesake</SelectItem>
                          <SelectItem value="Akademie">Akademie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {signupForm.afdeling && (
                      <div>
                        <Label htmlFor="afdelingsposisie">Posisie *</Label>
                        <Select 
                          value={signupForm.afdelingsposisie} 
                          onValueChange={(value) => setSignupForm({ ...signupForm, afdelingsposisie: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kies posisie" />
                          </SelectTrigger>
                          <SelectContent>
                            {signupForm.afdeling === 'Studentesake' && (
                              <>
                                <SelectItem value="Hoof">Hoof</SelectItem>
                                <SelectItem value="Studentesteun">Studentesteun</SelectItem>
                                <SelectItem value="Beampte">Beampte</SelectItem>
                                <SelectItem value="Intern">Intern</SelectItem>
                              </>
                            )}
                            {signupForm.afdeling === 'Akademie' && (
                              <>
                                <SelectItem value="Lektor">Lektor</SelectItem>
                                <SelectItem value="Afdelingshoof">Afdelingshoof</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="koshuisvoog">Is jy 'n Koshuisvoog?</Label>
                      <Select 
                        value={signupForm.isKoshuisvoog ? 'ja' : 'nee'} 
                        onValueChange={(value) => setSignupForm({ 
                          ...signupForm, 
                          isKoshuisvoog: value === 'ja',
                          koshuis: value === 'nee' ? '' : signupForm.koshuis
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nee">Nee</SelectItem>
                          <SelectItem value="ja">Ja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {signupForm.isKoshuisvoog && (
                      <div>
                        <Label htmlFor="koshuis">Watter Koshuis? *</Label>
                        <Select 
                          value={signupForm.koshuis} 
                          onValueChange={(value) => setSignupForm({ ...signupForm, koshuis: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kies koshuis" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Vaalbos">Vaalbos</SelectItem>
                            <SelectItem value="Heldehuis">Heldehuis</SelectItem>
                            <SelectItem value="Steenbok">Steenbok</SelectItem>
                            <SelectItem value="Duiker">Duiker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <Label htmlFor="signup-password">Wagwoord *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Bevestig Wagwoord *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Registreer...' : '📝 Registreer'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;