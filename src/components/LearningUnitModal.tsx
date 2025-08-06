import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, FileText, ExternalLink } from "lucide-react";

interface LearningUnit {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'document';
  content_url: string;
}

interface LearningUnitModalProps {
  unit: LearningUnit;
  onClose: () => void;
}

const LearningUnitModal = ({ unit, onClose }: LearningUnitModalProps) => {
  const isYouTube = unit.content_url.includes('youtube.com') || unit.content_url.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {unit.content_type === 'video' ? (
              <Play className="text-primary" size={24} />
            ) : (
              <FileText className="text-primary" size={24} />
            )}
            <span>{unit.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          <p className="text-muted-foreground">{unit.description}</p>
          
          <div className="flex-1 bg-muted rounded-lg p-4">
            {unit.content_type === 'video' ? (
              <div className="w-full h-full">
                {isYouTube ? (
                  <iframe
                    src={getYouTubeEmbedUrl(unit.content_url)}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allowFullScreen
                    title={unit.title}
                  />
                ) : (
                  <video
                    src={unit.content_url}
                    controls
                    className="w-full h-full rounded-lg"
                    title={unit.title}
                  >
                    Jou blaaier ondersteun nie video nie.
                  </video>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <FileText size={64} className="text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Klik die knoppie hieronder om die dokument oop te maak
                </p>
                <Button 
                  onClick={() => window.open(unit.content_url, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Maak Dokument Oop</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Sluit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningUnitModal;