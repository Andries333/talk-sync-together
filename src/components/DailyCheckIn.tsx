import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from "sonner";

interface DailyCheckIn {
  id: string;
  mood_rating: number;
  mood_label: string;
  questions_suggestions: string | null;
  check_in_date: string;
}

const MOOD_OPTIONS = [
  { value: 5, label: 'Uitstekend', color: 'bg-green-500', emoji: '😊' },
  { value: 4, label: 'Goed', color: 'bg-green-400', emoji: '🙂' },
  { value: 3, label: 'Gemiddeld', color: 'bg-yellow-500', emoji: '😐' },
  { value: 2, label: 'Moeilik', color: 'bg-orange-500', emoji: '😕' },
  { value: 1, label: 'Sleg', color: 'bg-red-500', emoji: '😞' }
];

const DailyCheckIn = () => {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todaysCheckIn, setTodaysCheckIn] = useState<DailyCheckIn | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [monthlyImpact, setMonthlyImpact] = useState<number>(0);

  useEffect(() => {
    checkTodaysCheckIn();
    calculateMonthlyImpact();
  }, []);

  const checkTodaysCheckIn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();

      if (error) {
        console.error('Error checking today\'s check-in:', error);
        return;
      }

      if (data) {
        setHasCheckedInToday(true);
        setTodaysCheckIn(data);
      }
    } catch (error) {
      console.error('Error checking today\'s check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyImpact = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('calculate_monthly_honorarium_impact', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error calculating monthly impact:', error);
        return;
      }

      setMonthlyImpact(data || 0);
    } catch (error) {
      console.error('Error calculating monthly impact:', error);
    }
  };

  const submitCheckIn = async () => {
    if (!selectedMood) {
      toast("Kies asseblief jou gemoedstoestand");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast("Jy moet aangemeld wees om in te check");
        return;
      }

      const moodOption = MOOD_OPTIONS.find(option => option.value === selectedMood);
      
      const { error } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          mood_rating: selectedMood,
          mood_label: moodOption?.label || '',
          questions_suggestions: questions.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast("Jy het reeds vandag ingecheck!");
        } else {
          console.error('Error submitting check-in:', error);
          toast("Fout: Kon nie incheck stoor nie");
        }
        return;
      }

      // Send email if there are questions/suggestions
      if (questions.trim()) {
        await supabase.functions.invoke('send-daily-checkin-email', {
          body: {
            user_email: user.email,
            mood_label: moodOption?.label,
            mood_rating: selectedMood,
            questions_suggestions: questions.trim()
          }
        });
      }

      toast("Dankie vir jou incheck!");
      await checkTodaysCheckIn();
      await calculateMonthlyImpact();
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast("Fout: Kon nie incheck stoor nie");
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodBarometerColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating === 3) return 'bg-yellow-500';
    if (rating === 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMoodBarometerProgress = (rating: number) => {
    return (rating / 5) * 100;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laai incheck status...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasCheckedInToday && todaysCheckIn) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-green-700">Dankie, jy het reeds vandag ingecheck!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Today's Mood Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Vandag se Gemoedstoestand</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {MOOD_OPTIONS.find(m => m.value === todaysCheckIn.mood_rating)?.emoji} {todaysCheckIn.mood_label}
              </Badge>
            </div>
            
            {/* Mood Barometer */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Gemoedstoestand Barometer</span>
                <span>{todaysCheckIn.mood_rating}/5</span>
              </div>
              <Progress 
                value={getMoodBarometerProgress(todaysCheckIn.mood_rating)} 
                className={`h-3 ${getMoodBarometerColor(todaysCheckIn.mood_rating)}`}
              />
            </div>
          </div>

          {/* Questions/Suggestions Display */}
          {todaysCheckIn.questions_suggestions && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Jou Vrae/Voorstelle</h3>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{todaysCheckIn.questions_suggestions}</p>
              </div>
            </div>
          )}

          {/* Monthly Impact */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <h3 className="font-medium">Maandelikse Honorarium Impak</h3>
            </div>
            <div className="flex items-center space-x-3">
              <Progress value={monthlyImpact} className="flex-1" />
              <Badge variant="secondary" className="text-sm">
                {monthlyImpact.toFixed(1)}% van 20%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Jou daaglikse inchecks dra by tot {monthlyImpact.toFixed(1)}% van jou totale honorarium vir hierdie maand.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle>Daaglikse Incheck</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Deel jou dag met ons en help ons jou beter ondersteun.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hoe was jou dag?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {MOOD_OPTIONS.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  selectedMood === mood.value ? mood.color : ''
                }`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Mood Barometer Preview */}
          {selectedMood && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Barometer Voorskou</span>
                <span>{selectedMood}/5</span>
              </div>
              <Progress 
                value={getMoodBarometerProgress(selectedMood)} 
                className={`h-3 ${getMoodBarometerColor(selectedMood)}`}
              />
            </div>
          )}
        </div>

        {/* Questions/Suggestions */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Het jy enige vrae of voorstelle vir vandag?</h3>
          <Textarea
            placeholder="Deel jou gedagtes, vrae of voorstelle... (opsioneel)"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Indien ingevul, sal dit gestuur word na andries@bko.co.za saam met jou gemoedstoestand.
          </p>
        </div>

        {/* Monthly Impact Preview */}
        <div className="space-y-2 p-4 bg-accent/10 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-medium">Huidige Maandelikse Impak</h3>
          </div>
          <div className="flex items-center space-x-3">
            <Progress value={monthlyImpact} className="flex-1" />
            <Badge variant="secondary" className="text-sm">
              {monthlyImpact.toFixed(1)}% van 20%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Jou daaglikse inchecks kan tot 20% van jou honorarium beïnvloed.
          </p>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={submitCheckIn}
          disabled={!selectedMood || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Stoor Incheck..." : "Stuur Incheck"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;