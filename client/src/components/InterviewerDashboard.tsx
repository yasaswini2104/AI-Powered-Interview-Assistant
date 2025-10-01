// client\src\components\InterviewerDashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/app/store';
import { fetchAllCandidates } from '../features/candidatesThunks';
import { type Candidate } from '../features/candidatesSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, Eye, ArrowUpDown, Download, Mail, Info } from 'lucide-react';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { generateAndDownloadPdf } from '../lib/pdfGenerator';
import { toast } from 'sonner';

export function InterviewerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { candidates, status, error } = useSelector((state: RootState) => state.candidates);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const interviewState = useSelector((state: RootState) => state.interview);
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  type SortableKeys = 'name' | 'email' | 'role' | 'finalScore' | 'createdAt';
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' });

  // DUAL MODE SUPPORT
  const isTrialMode = !userInfo;
  
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchAllCandidates());
    }
  }, [dispatch, userInfo]);

  // In trial mode, show the local completed interview from Redux state
  const trialModeCandidate = useMemo(() => {
    if (isTrialMode && interviewState.status === 'completed' && interviewState.candidateId) {
      // Calculate average score from interview history
      const totalScore = interviewState.history.reduce((acc, entry) => acc + (entry.score || 0), 0);
      const avgScore = interviewState.history.length > 0 ? totalScore / interviewState.history.length : 0;
      
      // Convert the interview state into a Candidate object with ALL required fields
      return {
        _id: interviewState.candidateId,
        name: interviewState.name || 'Trial User',
        email: interviewState.email || 'trial@example.com',
        phone: interviewState.phone || 'N/A', // ADD PHONE
        role: interviewState.role,
        finalScore: parseFloat(avgScore.toFixed(2)),
        summary: interviewState.finalSummary?.summary || 'Trial mode - Sign up to get AI-powered insights!',
        status: 'completed' as const,
        interviewHistory: interviewState.history,
        insights: interviewState.finalSummary?.insights || { strengths: [], weaknesses: [] },
        recommendation: interviewState.finalSummary?.recommendation || { 
          verdict: 'Trial Mode', 
          justification: 'Complete your sign-up to get detailed recommendations' 
        },
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }, [isTrialMode, interviewState]);

  const allCandidates = useMemo(() => {
    if (isTrialMode && trialModeCandidate) {
      return [trialModeCandidate];
    }
    return candidates;
  }, [isTrialMode, trialModeCandidate, candidates]);
  
  const handleDownload = async (candidate: Candidate) => {
    setIsDownloading(candidate._id);
    toast.info("Generating PDF...", { description: "This might take a moment." });
    try {
      await generateAndDownloadPdf(candidate);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF Generation Failed", { description: "Please try again." });
    } finally {
      setIsDownloading(null);
    }
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let sortableItems = [...allCandidates];
    if (searchTerm) {
        sortableItems = sortableItems.filter(c => 
            (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        if (key === 'name' || key === 'email' || key === 'role' || key === 'createdAt') {
          aValue = a[key];
          bValue = b[key];
        } else if (key === 'finalScore') {
          aValue = a.finalScore;
          bValue = b.finalScore;
        }

        if (aValue == null) return -1;
        if (bValue == null) return 1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [allCandidates, searchTerm, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const renderSortArrow = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-20"/>;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  }

  const isRecruiter = userInfo?.role === 'recruiter';
  const cardTitle = isTrialMode ? "Interview Dashboard (Trial Mode)" : (isRecruiter ? "Candidate Dashboard" : "My Interview History");
  const cardDescription = isTrialMode 
    ? "Your interview data is stored locally in your browser. Sign up to save across devices." 
    : (isRecruiter ? "Review and manage all candidate interviews." : "Review your past practice interview sessions.");
  const nameColumnTitle = isRecruiter ? "Candidate Name" : "My Name";

  const renderContent = () => {
    // In trial mode, don't show loading state from server
    if (!isTrialMode && status === 'loading') {
      return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!isTrialMode && status === 'failed') {
      return <div className="flex flex-col items-center justify-center h-48 text-red-600"><AlertCircle className="h-8 w-8 mb-2" /><p>Failed to load data: {error}</p></div>;
    }
    
    if (filteredAndSortedCandidates.length === 0) {
      return (
        <div className="text-center h-48 flex flex-col items-center justify-center gap-2">
          <p>No interviews found.</p>
          {isTrialMode && (
            <p className="text-sm text-slate-500">Complete an interview in the "Interviewee (Chat)" tab to see results here.</p>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center">{nameColumnTitle} {renderSortArrow('name')}</div>
            </TableHead>
            <TableHead>AI Summary</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('finalScore')}>
                <div className="flex items-center">Score {renderSortArrow('finalScore')}</div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedCandidates.map((candidate) => (
            <TableRow key={candidate._id}>
              <TableCell><div className="font-medium">{candidate.name || 'N/A'}</div><div className="text-sm text-slate-500">{candidate.email || 'N/A'}</div></TableCell>
              <TableCell className="max-w-sm truncate">{candidate.summary || 'No summary available.'}</TableCell>
              <TableCell className="font-bold text-lg">{candidate.finalScore.toFixed(1)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setSelectedCandidate(candidate)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownload(candidate)} disabled={isDownloading === candidate._id}>
                        {isDownloading === candidate._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    </Button>
                    {!isTrialMode && isRecruiter && candidate.email && (
                        <a href={`mailto:${candidate.email}?subject=Interview Follow-up`}>
                            <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
                        </a>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <>
      <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{cardTitle}</CardTitle>
                  <CardDescription>{cardDescription}</CardDescription>
                </div>
                {isTrialMode && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Info className="h-4 w-4" />
                    <span>Local Data Only</span>
                  </div>
                )}
              </div>
              <div className="mt-4"><Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
      </Card>
      <CandidateDetailsModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
    </>
  );
}