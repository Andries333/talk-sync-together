import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, Home, Star, Heart, UserCheck, BarChart3, BookOpen, MessageSquare } from "lucide-react";
import CalendarComponent from "@/components/Calendar";
import UserProfile from "@/components/UserProfile";
import UserTable from "@/components/UserTable";
import DailyCheckIn from "@/components/DailyCheckIn";
import AdminCheckInDashboard from "@/components/AdminCheckInDashboard";
import LearningPlan from "@/components/LearningPlan";
import NotificationCenter from "@/components/NotificationCenter";
import NotificationPopup from "@/components/NotificationPopup";
import ChatRoom from "@/components/ChatRoom";
import UpcomingEvents from "@/components/UpcomingEvents";
import HonorariumReport from "@/components/HonorariumReport";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile data when user logs in
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.first_name) {
      return profile.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Vriend';
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = [profile.first_name, profile.last_name, profile.posisie, profile.koshuis, profile.verjaarsdag, profile.telefoonnommer];
    if (profile.posisie !== 'Personeel') requiredFields.push(profile.studierigting);
    return requiredFields.every(field => field && field.trim() !== '');
  };

  const shouldBlockAccess = () => profile && profile.profile_completion_count >= 5 && !isProfileComplete();

  const handleTabChange = (tabId: string) => {
    if (shouldBlockAccess() && tabId !== 'profile' && tabId !== 'home') return;
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-lg border-b border-border/20">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-foreground to-accent-foreground bg-clip-text text-transparent">🎓 BKO Studentesake</h1>
          <p className="text-center mt-2 opacity-90">Admin Sisteem vir Leierskap en Studentesake</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-secondary text-secondary-foreground shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-1 py-3">
            {[
              { id: "home", label: "Tuis", icon: Home },
              { id: "checkin", label: "INLOER", icon: Heart },
              { id: "learning", label: "My Leerplan", icon: BookOpen },
              { id: "calendar", label: "Kalender", icon: Calendar },
              ...(profile?.posisie === 'HK' || profile?.posisie === 'SR' || profile?.posisie === 'Personeel' ? [{ id: "honorarium", label: "Honorarium", icon: Star }] : []),
              { id: "users", label: "Gebruikers", icon: UserCheck },
              ...(profile?.posisie === 'HK' || profile?.posisie === 'Personeel' ? [{ id: "admin", label: "Admin", icon: BarChart3 }] : []),
              { id: "profile", label: "Profiel", icon: Users },
              { id: "notifications", label: "Kennisgewings", icon: Bell },
              { id: "chat", label: "Gesels 'n bietjie hier", icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => handleTabChange(id)}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Personalized Welcome Message */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-6 md:p-8 mb-8 border border-border/20 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center space-x-3 mb-4">
                  <Star className="text-accent h-8 w-8 animate-pulse" />
                  <Heart className="text-primary h-6 w-6" />
                  <Star className="text-secondary h-8 w-8 animate-pulse" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                  Welkom, {getDisplayName()}!
                </h2>
                
                <div className="max-w-2xl mx-auto">
                  <p className="text-lg md:text-xl text-foreground/90 font-medium leading-relaxed">
                    Jy is nou in die BKO Adminstelsel vir Studentesake en Leierskap.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground mt-2 font-medium">
                    Bly op hoogte, bou saam, groei saam. 🌱
                  </p>
                </div>
                
                {profile?.studierigting && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-accent">Studierigting:</span> {profile.studierigting}
                    </p>
                    {profile?.posisie_hk_sr && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-secondary">Posisie:</span> {profile.posisie_hk_sr}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Heart size={24} />
                    <span>Daaglikse Incheck</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Deel jou dag en bou aan jou honorarium</p>
                  <Button 
                    className="mt-4 w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                    onClick={() => setActiveTab("checkin")}
                  >
                    INLOER
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Calendar size={24} />
                    <span>Opkomende Gebeure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Sien wat aankom in ons gemeenskapskalender</p>
                  <div className="mt-4">
                    <UpcomingEvents />
                  </div>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("calendar")}
                  >
                    Bekyk Kalender
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-accent">
                    <Users size={24} />
                    <span>Jou Profiel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Bestuur jou persoonlike inligting en verjaarsdae</p>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("profile")}
                  >
                    Bekyk Profiel
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-secondary">
                    <Bell size={24} />
                    <span>Kennisgewings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Belangrike aankondigings van die huiskomitee</p>
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={() => setActiveTab("notifications")}
                  >
                    Lees Kennisgewings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "checkin" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Daaglikse INLOER</h2>
              <p className="text-muted-foreground">Deel jou dag met ons en bou aan jou honorarium</p>
            </div>
            <div className="flex justify-center">
              <DailyCheckIn />
            </div>
          </div>
        )}

        {activeTab === "learning" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">My Leerplan</h2>
              <p className="text-muted-foreground">Leer en groei as 'n leier met ons gestruktureerde leerinhoud</p>
            </div>
            <LearningPlan />
          </div>
        )}

        {activeTab === "calendar" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">BKO Studentesake Kalender</h2>
              <p className="text-muted-foreground">Volledige Studentesake Gebeure & Skedulering</p>
            </div>
            <CalendarComponent />
          </div>
        )}

        {activeTab === "honorarium" && (profile?.posisie === 'HK' || profile?.posisie === 'SR' || profile?.posisie === 'Personeel') && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Honorarium Verslag</h2>
              <p className="text-muted-foreground">Maandelikse selfassessering vir leierskap honorarium</p>
            </div>
            <HonorariumReport />
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Jou Profiel</h2>
              <p className="text-muted-foreground">Bestuur jou persoonlike inligting en studiedetails</p>
            </div>
            <div className="flex justify-center">
              <UserProfile />
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Gebruiker Lys</h2>
              <p className="text-muted-foreground">Volledig sorteerbare en deursoekbare lys van alle geregistreerde gebruikers</p>
            </div>
            <UserTable />
          </div>
        )}

        {activeTab === "admin" && (profile?.posisie === 'HK' || profile?.posisie === 'Personeel') && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Admin Dashboard</h2>
              <p className="text-muted-foreground">Bestuur daaglikse inchecks en honorarium impakte</p>
            </div>
            <AdminCheckInDashboard />
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Kennisgewings</h2>
              <p className="text-muted-foreground">Stuur en ontvang belangrike aankondigings</p>
            </div>
            <div className="flex justify-center mb-6">
              <NotificationCenter />
            </div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-secondary">Onlangse Kennisgewings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Jy sal hier kennisgewings sien wanneer daar nuwe aankondigings is</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "chat" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Gesels 'n bietjie hier</h2>
              <p className="text-muted-foreground">Klets saam met ander lede wat aanlyn is</p>
            </div>
            <ChatRoom />
          </div>
        )}
      </main>

      {/* Notification Popup */}
      <NotificationPopup />

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p>&copy; 2024 BKO Studentesake. Alle regte voorbehou.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
