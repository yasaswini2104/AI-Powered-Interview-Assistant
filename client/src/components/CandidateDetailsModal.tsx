import { type Candidate } from '../features/candidatesSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatMessage';
import { ThumbsUp, ThumbsDown, Lightbulb, Check, X, Minus } from 'lucide-react';

interface CandidateDetailsModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

const getVerdictTheme = (verdict = '') => {
    switch (verdict) {
        case 'Strong Hire': return { color: 'bg-green-600', icon: <Check className="h-4 w-4" /> };
        case 'Hire': return { color: 'bg-green-500', icon: <Check className="h-4 w-4" /> };
        case 'Leaning Hire': return { color: 'bg-yellow-500', icon: <Minus className="h-4 w-4" /> };
        case 'Leaning No Hire': return { color: 'bg-orange-500', icon: <X className="h-4 w-4" /> };
        case 'No Hire': return { color: 'bg-red-600', icon: <X className="h-4 w-4" /> };
        default: return { color: 'bg-gray-400', icon: null };
    }
};

export function CandidateDetailsModal({ candidate, onClose }: CandidateDetailsModalProps) {
  if (!candidate) return null;

  const verdictTheme = getVerdictTheme(candidate.recommendation?.verdict);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl">{candidate.name || 'N/A'}</DialogTitle>
          <DialogDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 pt-1">
            <span>{candidate.email || 'No email provided'}</span>
            <span>|</span>
            <span>Applied for: <strong>{candidate.role}</strong></span>
            <Badge variant={candidate.finalScore > 7 ? 'default' : 'destructive'}>
              Final Score: {candidate.finalScore.toFixed(1)}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4 pr-4 space-y-4">
            {/* Display the new recommendation */}
            {candidate.recommendation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <span className={`flex items-center gap-2 px-3 py-1 text-white text-sm rounded-full ${verdictTheme.color}`}>
                            {verdictTheme.icon} {candidate.recommendation.verdict}
                        </span>
                    </h3>
                    <p className="text-slate-700 italic">"{candidate.recommendation.justification}"</p>
                </div>
            )}

            {/* AI Summary & Insights Section */}
            <div className="p-4 bg-slate-50 rounded-lg border">
                <h3 className="font-bold text-lg mb-2 flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-yellow-500"/>AI Summary & Insights</h3>
                <p className="text-slate-700 mb-4">{candidate.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold flex items-center text-green-700"><ThumbsUp className="mr-2 h-4 w-4"/>Strengths</h4>
                        <ul className="list-disc list-inside mt-1 text-slate-600 space-y-1">
                            {candidate.insights.strengths.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold flex items-center text-red-700"><ThumbsDown className="mr-2 h-4 w-4"/>Areas for Improvement</h4>
                        <ul className="list-disc list-inside mt-1 text-slate-600 space-y-1">
                            {candidate.insights.weaknesses.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Full Transcript Section */}
            <div>
                <h3 className="font-bold text-lg mb-2">Full Interview Transcript</h3>
                <div className="space-y-4 flex flex-col">
                    {candidate.interviewHistory.map((entry, index) => (
                        <div key={`t-${index}`} className="flex flex-col gap-4">
                            <ChatMessage role="ai" content={entry.question} />
                            {entry.answer && <ChatMessage role="user" content={entry.answer} />}
                            {entry.feedback && <ChatMessage role="feedback" content={`Feedback: ${entry.feedback}`} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

