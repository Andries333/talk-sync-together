import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[] | null;
  correct_answer: string;
  points: number;
}

interface LearningTestModalProps {
  learningUnitId: string;
  onComplete: (unitId: string, score: number, passed: boolean) => void;
  onClose: () => void;
}

const LearningTestModal = ({ learningUnitId, onComplete, onClose }: LearningTestModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{ score: number; passed: boolean; details: any[] }>({
    score: 0,
    passed: false,
    details: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [learningUnitId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_questions')
        .select('*')
        .eq('learning_unit_id', learningUnitId)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Fout",
        description: "Kon nie vrae laai nie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;
    const details: any[] = [];

    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id]?.trim().toLowerCase() || '';
      const correctAnswer = question.correct_answer.trim().toLowerCase();
      
      let isCorrect = false;
      
      if (question.question_type === 'multiple_choice') {
        isCorrect = userAnswer === correctAnswer;
      } else {
        // For short answer, allow some flexibility
        isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
      }
      
      if (isCorrect) {
        earnedPoints += question.points;
      }
      
      details.push({
        question: question.question_text,
        userAnswer: answers[question.id] || '',
        correctAnswer: question.correct_answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points
      });
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= 70; // 70% pass rate

    return { score, passed, details };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Onvolledige Toets",
        description: "Beantwoord asseblief alle vrae voor jy indien",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const testResults = calculateScore();
      setResults(testResults);
      setShowResults(true);
      
      // Save to database
      await onComplete(learningUnitId, testResults.score, testResults.passed);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: "Fout",
        description: "Kon nie toets indien nie",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (questions.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geen Toets Beskikbaar</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <FileQuestion size={64} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Daar is geen vrae vir hierdie leerstuk nie.</p>
            <Button onClick={onClose} className="mt-4">Sluit</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileQuestion className="text-primary" size={24} />
            <span>Hersieningstoets</span>
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Beantwoord alle vrae om die leerstuk te voltooi. Jy benodig 70% om te slaag.
            </p>

            {questions.map((question, index) => (
              <Card key={question.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-foreground">
                        Vraag {index + 1}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {question.points} punt{question.points !== 1 ? 'e' : ''}
                      </span>
                    </div>
                    
                    <p className="text-foreground">{question.question_text}</p>
                    
                    {question.question_type === 'multiple_choice' && question.options ? (
                      <RadioGroup 
                        value={answers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={option} 
                              id={`${question.id}-${optionIndex}`} 
                            />
                            <Label 
                              htmlFor={`${question.id}-${optionIndex}`}
                              className="text-foreground"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        placeholder="Jou antwoord..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Kanselleer
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? "Verwerk..." : "Dien Toets In"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {results.passed ? (
                  <CheckCircle className="text-accent" size={64} />
                ) : (
                  <XCircle className="text-destructive" size={64} />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {results.passed ? "Gefeliciteerd!" : "Probeer Weer"}
              </h3>
              
              <p className="text-lg text-muted-foreground mb-4">
                Jy het {results.score}% gekry
              </p>
              
              <p className="text-sm text-muted-foreground">
                {results.passed 
                  ? "Jy het die toets geslaag en die leerstuk voltooi!"
                  : "Jy benodig 70% om te slaag. Bestudeer die materiaal weer en probeer weer."
                }
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Uitslag Besonderhede:</h4>
              {results.details.map((detail, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {detail.isCorrect ? (
                          <CheckCircle className="text-accent" size={16} />
                        ) : (
                          <XCircle className="text-destructive" size={16} />
                        )}
                        <span className="font-medium text-foreground">
                          Vraag {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {detail.points}/{detail.maxPoints} punte
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground">{detail.question}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Jou antwoord:</span>
                          <p className="text-foreground">{detail.userAnswer}</p>
                        </div>
                        
                        {!detail.isCorrect && (
                          <div>
                            <span className="font-medium text-muted-foreground">Korrekte antwoord:</span>
                            <p className="text-accent">{detail.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button onClick={onClose}>
                Sluit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LearningTestModal;