import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HonorariumReport {
  id: string;
  user_id: string;
  report_month: string;
  leadership_effectiveness: number;
  team_collaboration: number;
  initiative_taken: number;
  responsibility_handling: number;
  goal_achievement: number;
  achievements?: string;
  challenges?: string;
  improvement_areas?: string;
  total_score: number;
  suggested_honorarium: number;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    posisie: string;
    koshuis: string;
  };
}

const HonorariumReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState<HonorariumReport[]>([]);
  const [allReports, setAllReports] = useState<HonorariumReport[]>([]);
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    report_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    leadership_effectiveness: 3,
    team_collaboration: 3,
    initiative_taken: 3,
    responsibility_handling: 3,
    goal_achievement: 3,
    achievements: '',
    challenges: '',
    improvement_areas: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserReports();
      if (userProfile?.posisie === 'Personeel') {
        fetchAllReports();
        setActiveTab('overview');
      }
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    try {
      const { data, error } = await supabase
        .from('honorarium_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_month', { ascending: false });

      if (error) throw error;
      setReports((data || []) as HonorariumReport[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Fout",
        description: "Kon nie verslagte laai nie",
        variant: "destructive"
      });
    }
  };

  const fetchAllReports = async () => {
    try {
      const { data, error } = await supabase
        .from('honorarium_reports')
        .select(`
          *,
          profiles!honorarium_reports_user_id_fkey (
            first_name,
            last_name,
            posisie,
            koshuis
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setAllReports((data || []) as any);
    } catch (error) {
      console.error('Error fetching all reports:', error);
      toast({
        title: "Fout",
        description: "Kon nie alle verslagte laai nie",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('honorarium_reports')
        .insert([{
          user_id: user.id,
          ...formData,
          report_month: formData.report_month + '-01' // Convert to proper date format
        }]);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Honorarium verslag suksesvol ingedien"
      });

      // Reset form
      setFormData({
        report_month: new Date().toISOString().slice(0, 7),
        leadership_effectiveness: 3,
        team_collaboration: 3,
        initiative_taken: 3,
        responsibility_handling: 3,
        goal_achievement: 3,
        achievements: '',
        challenges: '',
        improvement_areas: ''
      });

      fetchUserReports();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon nie verslag indien nie",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('honorarium_reports')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: `Verslag status opdateer na ${status}`
      });

      fetchAllReports();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Fout",
        description: "Kon nie status opdateer nie",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Ingedien</Badge>;
      case 'reviewed':
        return <Badge variant="default"><AlertCircle className="w-3 h-3 mr-1" />Beskou</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Goedgekeur</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canSubmitThisMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return !reports.some(report => 
      report.report_month.slice(0, 7) === currentMonth
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Laai honorarium data...</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.posisie || !['HK', 'SR', 'Personeel'].includes(userProfile.posisie)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Honorarium Verslag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hierdie funksie is slegs beskikbaar vir HK, SR en Personeel lede.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Honorarium Verslag</h1>
          <p className="text-muted-foreground">
            Maandelikse selfassessering vir leierskap honorarium
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {userProfile?.posisie !== 'Personeel' && (
            <TabsTrigger value="form">Nuwe Verslag</TabsTrigger>
          )}
          <TabsTrigger value="history">My Verslagte</TabsTrigger>
          {userProfile?.posisie === 'Personeel' && (
            <TabsTrigger value="overview">Alle Verslagte</TabsTrigger>
          )}
        </TabsList>

        {userProfile?.posisie !== 'Personeel' && (
          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Maandelikse Honorarium Verslag
                </CardTitle>
                <CardDescription>
                  Voltooi jou maandelikse selfassessering vir leierskap honorarium berekening
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!canSubmitThisMonth() ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Verslag Reeds Ingedien</h3>
                    <p className="text-muted-foreground">
                      Jy het reeds 'n verslag vir hierdie maand ingedien.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="report_month">Verslag Maand</Label>
                        <Input
                          id="report_month"
                          type="month"
                          value={formData.report_month}
                          onChange={(e) => setFormData(prev => ({ ...prev, report_month: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Selfassessering (1-5 skaal)</h3>
                      
                      {[
                        { key: 'leadership_effectiveness', label: 'Leierskap Effektiwiteit' },
                        { key: 'team_collaboration', label: 'Span Samewerking' },
                        { key: 'initiative_taken', label: 'Inisiatief Geneem' },
                        { key: 'responsibility_handling', label: 'Verantwoordelikheid Hantering' },
                        { key: 'goal_achievement', label: 'Doelwit Bereiking' }
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                          <Label>{label}</Label>
                          <div className="flex items-center space-x-4">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [key]: value }))}
                                className={`w-10 h-10 rounded-full border-2 transition-colors ${
                                  formData[key as keyof typeof formData] === value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="achievements">Prestasies</Label>
                        <Textarea
                          id="achievements"
                          placeholder="Beskryf jou belangrikste prestasies vir die maand..."
                          value={formData.achievements}
                          onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="challenges">Uitdagings</Label>
                        <Textarea
                          id="challenges"
                          placeholder="Watter uitdagings het jy ondervind?"
                          value={formData.challenges}
                          onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="improvement_areas">Verbeteringsareas</Label>
                        <Textarea
                          id="improvement_areas"
                          placeholder="Waarin wil jy volgende maand verbeter?"
                          value={formData.improvement_areas}
                          onChange={(e) => setFormData(prev => ({ ...prev, improvement_areas: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">Voorlopige Honorarium Berekening</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gebaseer op jou huidige tellings: R{(200 + ((
                          formData.leadership_effectiveness + 
                          formData.team_collaboration + 
                          formData.initiative_taken + 
                          formData.responsibility_handling + 
                          formData.goal_achievement
                        ) / 25) * 300).toFixed(2)}
                      </p>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? 'Dien In...' : 'Dien Verslag In'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>My Verslagte</CardTitle>
              <CardDescription>Oorsig van jou ingestuurde honorarium verslagte</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Geen verslagte nog nie. Begin deur jou eerste verslag in te dien.
                </p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {new Date(report.report_month).toLocaleDateString('af-ZA', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </h4>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Totale Telling:</span>
                          <div className="font-semibold">{report.total_score}/25</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Voorgestelde Honorarium:</span>
                          <div className="font-semibold">R{report.suggested_honorarium}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ingedien:</span>
                          <div className="font-semibold">
                            {new Date(report.submitted_at).toLocaleDateString('af-ZA')}
                          </div>
                        </div>
                        {report.reviewed_at && (
                          <div>
                            <span className="text-muted-foreground">Beskou:</span>
                            <div className="font-semibold">
                              {new Date(report.reviewed_at).toLocaleDateString('af-ZA')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {userProfile?.posisie === 'Personeel' && (
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Alle Honorarium Verslagte</CardTitle>
                <CardDescription>Oorsig en bestuur van alle ingestuurde verslagte</CardDescription>
              </CardHeader>
              <CardContent>
                {allReports.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Geen verslagte beskikbaar nie.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {report.profiles?.first_name} {report.profiles?.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {report.profiles?.posisie} - {report.profiles?.koshuis}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">R{report.suggested_honorarium}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(report.report_month).toLocaleDateString('af-ZA', { 
                                year: 'numeric', 
                                month: 'long' 
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Leierskap:</span>
                            <div className="font-semibold">{report.leadership_effectiveness}/5</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Samewerking:</span>
                            <div className="font-semibold">{report.team_collaboration}/5</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Inisiatief:</span>
                            <div className="font-semibold">{report.initiative_taken}/5</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Verantwoordelikheid:</span>
                            <div className="font-semibold">{report.responsibility_handling}/5</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Doelwitte:</span>
                            <div className="font-semibold">{report.goal_achievement}/5</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {getStatusBadge(report.status)}
                          <div className="space-x-2">
                            {report.status === 'submitted' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateReportStatus(report.id, 'reviewed')}
                                >
                                  Merk as Beskou
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => updateReportStatus(report.id, 'approved')}
                                >
                                  Keur Goed
                                </Button>
                              </>
                            )}
                            {report.status === 'reviewed' && (
                              <Button 
                                size="sm"
                                onClick={() => updateReportStatus(report.id, 'approved')}
                              >
                                Keur Goed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default HonorariumReport;