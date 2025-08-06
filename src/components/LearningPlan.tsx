import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle, Circle, Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LearningUnitModal from "./LearningUnitModal";
import LearningTestModal from "./LearningTestModal";
import AdminLearningModal from "./AdminLearningModal";

interface LearningUnit {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document';
  content_url: string;
  is_active: boolean;
  created_at: string;
  order_index: number;
}

interface UserProgress {
  id: string;
  learning_unit_id: string;
  is_completed: boolean;
  completed_at: string | null;
  test_score: number | null;
}

interface Profile {
  posisie?: string;
}

const LearningPlan = () => {
  const [learningUnits, setLearningUnits] = useState<LearningUnit[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [showTest, setShowTest] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<LearningUnit | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('posisie')
        .eq('user_id', user.id)
        .single();
      
      setProfile(profileData);

      // Fetch learning units
      const { data: unitsData, error: unitsError } = await supabase
        .from('learning_units')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (unitsError) throw unitsError;
      setLearningUnits(unitsData || []);

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;
      setUserProgress(progressData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Fout",
        description: "Kon nie leerplan data laai nie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.posisie === 'HK' || profile?.posisie === 'Personeel';

  const getUnitProgress = (unitId: string) => {
    return userProgress.find(p => p.learning_unit_id === unitId);
  };

  const completedUnits = userProgress.filter(p => p.is_completed).length;
  const totalUnits = learningUnits.length;
  const progressPercentage = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;

  const handleStartLesson = (unit: LearningUnit) => {
    setSelectedUnit(unit);
  };

  const handleStartTest = (unitId: string) => {
    setShowTest(unitId);
  };

  const handleTestComplete = async (unitId: string, score: number, passed: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update or create progress record
      const { error } = await supabase
        .from('user_learning_progress')
        .upsert({
          user_id: user.id,
          learning_unit_id: unitId,
          is_completed: passed,
          test_score: score,
          completed_at: passed ? new Date().toISOString() : null,
        });

      if (error) throw error;

      await fetchData(); // Refresh data
      setShowTest(null);

      toast({
        title: passed ? "Gefeliciteerd!" : "Probeer weer",
        description: passed 
          ? `Jy het die toets geslaag met ${score}%`
          : `Jy het ${score}% gekry. Jy benodig 70% om te slaag.`,
        variant: passed ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error saving test result:', error);
      toast({
        title: "Fout",
        description: "Kon nie toetsuitslag stoor nie",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <BookOpen size={24} />
            <span>My Leerplan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Algehele Vordering</span>
              <span className="text-sm text-muted-foreground">{completedUnits}/{totalUnits} voltooi</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Jy het {completedUnits} van {totalUnits} leerstukke voltooi ({Math.round(progressPercentage)}%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Controls */}
      {isAdmin && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-accent">
                <Users size={24} />
                <span>Admin Kontrole</span>
              </div>
              <Button onClick={() => setShowAdminModal(true)} size="sm">
                <Plus size={16} className="mr-2" />
                Voeg Leerstuk By
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Learning Units */}
      <div className="grid gap-4">
        {learningUnits.map((unit) => {
          const progress = getUnitProgress(unit.id);
          const isCompleted = progress?.is_completed || false;
          
          return (
            <Card key={unit.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      {isCompleted ? (
                        <CheckCircle className="text-accent" size={24} />
                      ) : (
                        <Circle className="text-muted-foreground" size={24} />
                      )}
                      <h3 className="text-lg font-semibold text-foreground">{unit.title}</h3>
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? "Voltooi" : "Nie voltooi"}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground ml-9">{unit.description}</p>
                    
                    {progress?.test_score && (
                      <p className="text-sm text-accent ml-9">
                        Toets telling: {progress.test_score}%
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUnit(unit)}
                      >
                        Redigeer
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleStartLesson(unit)}
                      variant="outline"
                      size="sm"
                    >
                      <Play size={16} className="mr-2" />
                      {unit.content_type === 'video' ? 'Kyk Video' : 'Lees Dokument'}
                    </Button>
                    
                    <Button
                      onClick={() => handleStartTest(unit.id)}
                      disabled={isCompleted}
                      size="sm"
                    >
                      {isCompleted ? 'Voltooi' : 'Begin Toets'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {learningUnits.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Geen leerstukke beskikbaar nie</p>
            {isAdmin && (
              <Button onClick={() => setShowAdminModal(true)}>
                <Plus size={16} className="mr-2" />
                Voeg Eerste Leerstuk By
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedUnit && (
        <LearningUnitModal
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}

      {showTest && (
        <LearningTestModal
          learningUnitId={showTest}
          onComplete={handleTestComplete}
          onClose={() => setShowTest(null)}
        />
      )}

      {showAdminModal && (
        <AdminLearningModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => {
            setShowAdminModal(false);
            fetchData();
          }}
        />
      )}

      {editingUnit && (
        <AdminLearningModal
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSuccess={() => {
            setEditingUnit(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default LearningPlan;