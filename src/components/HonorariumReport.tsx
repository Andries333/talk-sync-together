import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HonorariumReport {
  id: string;
  user_id: string;
  report_month: string;
  q1_leadership_vision: number;
  q2_team_motivation: number;
  q3_conflict_resolution: number;
  q4_communication_skills: number;
  q5_project_management: number;
  q6_student_engagement: number;
  q7_problem_solving: number;
  q8_time_management: number;
  q9_innovation_creativity: number;
  q10_mentorship_support: number;
  achievements?: string;
  challenges?: string;
  improvement_areas?: string;
  total_score: number;
  suggested_honorarium: number;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_comments?: string;
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
  const [adminComments, setAdminComments] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Form data
  const [formData, setFormData] = useState({
    report_month: new Date().toISOString().slice(0, 7),
    q1_leadership_vision: 3,
    q2_team_motivation: 3,
    q3_conflict_resolution: 3,
    q4_communication_skills: 3,
    q5_project_management: 3,
    q6_student_engagement: 3,
    q7_problem_solving: 3,
    q8_time_management: 3,
    q9_innovation_creativity: 3,
    q10_mentorship_support: 3,
    achievements: '',
    challenges: '',
    improvement_areas: ''
  });

  const questions = [
    { key: 'q1_leadership_vision', label: '1. Leierskap Visie: Kan jy ander inspireer en duidelike rigting gee?' },
    { key: 'q2_team_motivation', label: '2. Span Motivering: Hoe goed motiveer jy jou span en kollegas?' },
    { key: 'q3_conflict_resolution', label: '3. Konflik Resolusie: Kan jy konflikte effektief hanteer en oplos?' },
    { key: 'q4_communication_skills', label: '4. Kommunikasie Vaardighede: Hoe duidelik kommunikeer jy met ander?' },
    { key: 'q5_project_management', label: '5. Projek Bestuur: Kan jy projekte suksesvol beplan en uitvoer?' },
    { key: 'q6_student_engagement', label: '6. Student Betrokkenheid: Hoe goed betrek jy studente by aktiwiteite?' },
    { key: 'q7_problem_solving', label: '7. Probleem Oplossing: Kan jy kreatiewe oplossings vir uitdagings vind?' },
    { key: 'q8_time_management', label: '8. Tyd Bestuur: Bestuur jy jou tyd en prioriteite effektief?' },
    { key: 'q9_innovation_creativity', label: '9. Innovasie & Kreatiwiteit: Bring jy nuwe idees en verbeteringe?' },
    { key: 'q10_mentorship_support', label: '10. Mentorskap & Ondersteuning: Help jy ander om te groei en ontwikkel?' }
  ];

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
          report_month: formData.report_month + '-01'
        }]);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Honorarium verslag suksesvol ingedien"
      });

      setFormData({
        report_month: new Date().toISOString().slice(0, 7),
        q1_leadership_vision: 3,
        q2_team_motivation: 3,
        q3_conflict_resolution: 3,
        q4_communication_skills: 3,
        q5_project_management: 3,
        q6_student_engagement: 3,
        q7_problem_solving: 3,
        q8_time_management: 3,
        q9_innovation_creativity: 3,
        q10_mentorship_support: 3,
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

  const updateReportStatus = async (reportId: string, status: string, comments?: string) => {
    try {
      const updateData: any = { 
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      };
      
      if (comments !== undefined) {
        updateData.admin_comments = comments;
      }

      const { error } = await supabase
        .from('honorarium_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: `Verslag status opdateer na ${status}`
      });

      // Clear local comments
      setAdminComments(prev => {
        const newComments = { ...prev };
        delete newComments[reportId];
        return newComments;
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

  const calculateCurrentScore = () => {
    return formData.q1_leadership_vision + 
           formData.q2_team_motivation + 
           formData.q3_conflict_resolution + 
           formData.q4_communication_skills + 
           formData.q5_project_management +
           formData.q6_student_engagement +
           formData.q7_problem_solving +
           formData.q8_time_management +
           formData.q9_innovation_creativity +
           formData.q10_mentorship_support;
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
          <TabsTrigger value="form">Nuwe Verslag</TabsTrigger>
          <TabsTrigger value="history">My Verslagte</TabsTrigger>
          {userProfile?.posisie === 'Personeel' && (
            <TabsTrigger value="overview">Alle Verslagte</TabsTrigger>
          )}
        </TabsList>

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

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Maandelikse Selfassessering (1-5 skaal)</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Beoordeel jouself eerlik op elke aspek: 1 = Swak, 2 = Onder gemiddeld, 3 = Gemiddeld, 4 = Goed, 5 = Uitstekend
                        </p>
                      </div>
                      
                      {questions.map(({ key, label }) => (
                        <div key={key} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                          <Label className="text-sm font-medium">{label}</Label>
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


                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? 'Dien In...' : 'Dien Verslag In'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
        </TabsContent>

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
                          <div className="font-semibold">{report.total_score}/50</div>
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
                       
                       {report.admin_comments && (
                         <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                           <h5 className="font-semibold text-sm mb-2">Admin Opmerkings:</h5>
                           <p className="text-sm">{report.admin_comments}</p>
                         </div>
                       )}
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Totale Telling:</span>
                            <div className="font-semibold">{report.total_score}/50</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gemiddeld:</span>
                            <div className="font-semibold">{(report.total_score / 10).toFixed(1)}/5</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vlak:</span>
                            <div className="font-semibold">
                              {report.total_score >= 40 ? 'Uitstekend' : 
                               report.total_score >= 30 ? 'Goed' : 
                               report.total_score >= 20 ? 'Gemiddeld' : 'Onder Gemiddeld'}
                            </div>
                          </div>
                        </div>

                         {report.status !== 'approved' && userProfile?.posisie === 'Personeel' && (
                           <div className="mt-4">
                             <Label htmlFor={`comments-${report.id}`} className="text-sm font-medium">
                               Admin Opmerkings:
                             </Label>
                             <Textarea
                               id={`comments-${report.id}`}
                               placeholder="Voeg opmerkings by vir die student..."
                               value={adminComments[report.id] || report.admin_comments || ''}
                               onChange={(e) => setAdminComments(prev => ({ 
                                 ...prev, 
                                 [report.id]: e.target.value 
                               }))}
                               rows={3}
                               className="mt-2"
                             />
                           </div>
                         )}

                         <div className="flex items-center justify-between mt-4">
                           {getStatusBadge(report.status)}
                           <div className="space-x-2">
                             {report.status === 'submitted' && userProfile?.posisie === 'Personeel' && (
                               <>
                                 <Button 
                                   size="sm" 
                                   variant="outline"
                                   onClick={() => updateReportStatus(
                                     report.id, 
                                     'reviewed', 
                                     adminComments[report.id] || report.admin_comments
                                   )}
                                 >
                                   Merk as Beskou
                                 </Button>
                                 <Button 
                                   size="sm"
                                   onClick={() => updateReportStatus(
                                     report.id, 
                                     'approved', 
                                     adminComments[report.id] || report.admin_comments
                                   )}
                                 >
                                   Keur Goed
                                 </Button>
                               </>
                             )}
                             {report.status === 'reviewed' && userProfile?.posisie === 'Personeel' && (
                               <Button 
                                 size="sm"
                                 onClick={() => updateReportStatus(
                                   report.id, 
                                   'approved', 
                                   adminComments[report.id] || report.admin_comments
                                 )}
                               >
                                 Keur Goed
                               </Button>
                             )}
                           </div>
                         </div>
                         
                         {report.admin_comments && report.status === 'approved' && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                             <h5 className="font-semibold text-sm mb-2 text-green-800">Final Admin Opmerkings:</h5>
                             <p className="text-sm text-green-700">{report.admin_comments}</p>
                           </div>
                         )}
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