import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, Home } from "lucide-react";
import CalendarComponent from "@/components/Calendar";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Vaalbos Huiskomitee</h1>
          <p className="text-center mt-2 opacity-90">Gemeenskapsapp vir Vaalbos inwoners</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-secondary text-secondary-foreground shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-1 py-3">
            {[
              { id: "home", label: "Tuis", icon: Home },
              { id: "calendar", label: "Kalender", icon: Calendar },
              { id: "profile", label: "Profiel", icon: Users },
              { id: "notifications", label: "Kennisgewings", icon: Bell },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => setActiveTab(id)}
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Welkom by die Vaalbos Gemeenskap!</h2>
              <p className="text-muted-foreground">Bly op hoogte van belangrike datums, gebeure en kennisgewings</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Calendar size={24} />
                    <span>Opkomende Gebeure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Sien wat aankom in ons gemeenskapskalender</p>
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

        {activeTab === "calendar" && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">BKO Studentesake Kalender</h2>
              <p className="text-muted-foreground">Volledige Studentesake Gebeure & Skedulering</p>
            </div>
            <CalendarComponent />
          </div>
        )}

        {activeTab === "profile" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-accent">Jou Profiel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Profiel en registrasie sal hier kom</p>
                <p className="text-sm text-muted-foreground">
                  Supabase authentication moet eers gekoppel word
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-secondary">Kennisgewings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Kennisgewings sal hier kom</p>
                <p className="text-sm text-muted-foreground">
                  Supabase moet eers gekoppel word vir real-time kennisgewings
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p>&copy; 2024 Vaalbos Huiskomitee. Alle regte voorbehou.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
