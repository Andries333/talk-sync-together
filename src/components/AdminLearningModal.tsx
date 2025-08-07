import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Upload, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearningUnit {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document';
  content_url: string;
  is_active: boolean;
  order_index: number;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[] | null;
  correct_answer: string;
  points: number;
  order_index: number;
}

interface AdminLearningModalProps {
  unit?: LearningUnit;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminLearningModal = ({ unit, onClose, onSuccess }: AdminLearningModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video' as 'video' | 'document',
    content_url: '',
    is_active: true,
    order_index: 0
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (unit) {
      setFormData({
        title: unit.title,
        description: unit.description,
        content_type: unit.content_type,
        content_url: unit.content_url,
        is_active: unit.is_active,
        order_index: unit.order_index
      });
      fetchQuestions();
    }
  }, [unit]);

  const fetchQuestions = async () => {
    if (!unit) return;
    
    try {
      const { data, error } = await supabase
        .from('learning_questions' as any)
        .select('*')
        .eq('learning_unit_id', unit.id)
        .order('order_index');

      if (error) throw error;
      setQuestions((data as any) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options.push('');
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex].options = options;
    setQuestions(updatedQuestions);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `learning-content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('learning-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('learning-content')
        .getPublicUrl(filePath);

      toast({
        title: "Sukses",
        description: "Lêer suksesvol opgelaai!",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Fout",
        description: "Kon nie lêer oplaai nie. Probeer weer.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const uploadedUrl = await handleFileUpload(file);
    
    if (uploadedUrl) {
      setFormData({
        ...formData,
        content_url: uploadedUrl,
        content_type: 'document'
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content_url) {
      toast({
        title: "Onvolledige Inligting",
        description: "Titel en inhoud URL is verpligtend",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let learningUnitId: string;

      if (unit) {
        // Update existing unit
        const { error: updateError } = await supabase
          .from('learning_units' as any)
          .update(formData)
          .eq('id', unit.id);

        if (updateError) throw updateError;
        learningUnitId = unit.id;

        // Delete existing questions
        const { error: deleteError } = await supabase
          .from('learning_questions' as any)
          .delete()
          .eq('learning_unit_id', unit.id);

        if (deleteError) throw deleteError;
      } else {
        // Create new unit
        const { data: newUnit, error: createError } = await supabase
          .from('learning_units' as any)
          .insert(formData)
          .select()
          .single();

        if (createError) throw createError;
        learningUnitId = (newUnit as any).id;
      }

      // Insert questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map(q => ({
          ...q,
          learning_unit_id: learningUnitId,
          options: q.question_type === 'multiple_choice' ? q.options : null
        }));

        const { error: questionsError } = await supabase
          .from('learning_questions' as any)
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: "Sukses",
        description: unit ? "Leerstuk is opgedateer" : "Leerstuk is bygevoeg",
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving learning unit:', error);
      toast({
        title: "Fout",
        description: "Kon nie leerstuk stoor nie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Redigeer Leerstuk' : 'Voeg Leerstuk By'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Basiese Inligting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Leerstuk titel"
                />
              </div>

              <div>
                <Label htmlFor="description">Beskrywing</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Beskryf wat studente sal leer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content_type">Inhoud Tipe</Label>
                  <Select 
                    value={formData.content_type} 
                    onValueChange={(value: 'video' | 'document') => 
                      setFormData({...formData, content_type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Dokument</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order_index">Volgorde</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content_url">
                  {formData.content_type === 'video' ? 'Video URL (YouTube of MP4)' : 'Dokument URL of Laai Lêer Op'}
                </Label>
                <div className="space-y-2">
                  <Input
                    id="content_url"
                    value={formData.content_url}
                    onChange={(e) => setFormData({...formData, content_url: e.target.value})}
                    placeholder={formData.content_type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/document.pdf'}
                  />
                  
                  {formData.content_type === 'document' && (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">Laai op...</span>
                            </div>
                          ) : uploadedFile ? (
                            <div className="flex items-center space-x-2">
                              <File className="w-8 h-8 text-primary" />
                              <div className="text-center">
                                <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">Suksesvol opgelaai</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Klik om lêer op te laai</span> of sleep hier
                              </p>
                              <p className="text-xs text-muted-foreground">PDF, PPT, DOC, MP4 (Max. 50MB)</p>
                            </>
                          )}
                        </div>
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.avi,.mov"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Aktief</Label>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Hersieningsvrae</span>
                <Button onClick={addQuestion} size="sm">
                  <Plus size={16} className="mr-2" />
                  Voeg Vraag By
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="bg-muted border-border">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical size={16} className="text-muted-foreground" />
                          <span className="font-medium">Vraag {questionIndex + 1}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      <div>
                        <Label>Vraag Teks</Label>
                        <Textarea
                          value={question.question_text}
                          onChange={(e) => updateQuestion(questionIndex, 'question_text', e.target.value)}
                          placeholder="Vul die vraag in"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vraag Tipe</Label>
                          <Select 
                            value={question.question_type}
                            onValueChange={(value: 'multiple_choice' | 'short_answer') => 
                              updateQuestion(questionIndex, 'question_type', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Meerkeuse</SelectItem>
                              <SelectItem value="short_answer">Kort Antwoord</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Punte</Label>
                          <Input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      {question.question_type === 'multiple_choice' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Opsies</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                            >
                              <Plus size={16} className="mr-1" />
                              Voeg Opsie By
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Opsie ${optionIndex + 1}`}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  disabled={(question.options?.length || 0) <= 2}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>Korrekte Antwoord</Label>
                        {question.question_type === 'multiple_choice' ? (
                          <Select 
                            value={question.correct_answer}
                            onValueChange={(value) => updateQuestion(questionIndex, 'correct_answer', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kies korrekte antwoord" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options?.map((option, optionIndex) => (
                                <SelectItem key={optionIndex} value={option}>
                                  {option || `Opsie ${optionIndex + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={question.correct_answer}
                            onChange={(e) => updateQuestion(questionIndex, 'correct_answer', e.target.value)}
                            placeholder="Korrekte antwoord"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Geen vrae bygevoeg nie. Klik "Voeg Vraag By" om te begin.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Kanselleer
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Stoor..." : (unit ? "Werk By" : "Voeg By")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLearningModal;