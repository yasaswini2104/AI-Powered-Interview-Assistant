import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '@/app/store';
import { fetchAllCandidates } from '../features/candidatesThunks';
import { type Candidate } from '../features/candidatesSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, Eye, ArrowUpDown, Download, Mail } from 'lucide-react';
import { CandidateDetailsModal } from './CandidateDetailsModal';
import { generateAndDownloadPdf } from '../lib/pdfGenerator';
import { toast } from 'sonner';

export function InterviewerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { candidates, status, error } = useSelector((state: RootState) => state.candidates);
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Candidate; direction: 'asc' | 'desc' } | null>({ key: 'finalScore', direction: 'desc' });

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAllCandidates());
  }, [status, dispatch]);
  
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
    let sortableItems = [...candidates];
    if (searchTerm) {
        sortableItems = sortableItems.filter(c => 
            (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    if (sortConfig) {
      // --- THIS IS THE FIX ---
      // This new sorting logic is fully type-safe and handles undefined values.
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Treat null or undefined values as "smaller"
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
  }, [candidates, searchTerm, sortConfig]);

  const requestSort = (key: keyof Candidate) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const renderSortArrow = (key: keyof Candidate) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-20"/>;
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  }

  const renderContent = () => {
    if (status === 'loading') return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (status === 'failed') return <div className="flex flex-col items-center justify-center h-48 text-red-600"><AlertCircle className="h-8 w-8 mb-2" /><p>Failed to load candidates: {error}</p></div>;
    if (status === 'succeeded' && filteredAndSortedCandidates.length === 0) return <div className="text-center h-48 flex items-center justify-center"><p>No candidates found.</p></div>;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center">Name {renderSortArrow('name')}</div>
            </TableHead>
            <TableHead>Summary</TableHead>
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
                    {candidate.email && (
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
              <CardTitle>Candidate Dashboard</CardTitle>
              <CardDescription>Review and manage all completed interviews.</CardDescription>
              <div className="mt-4"><Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
      </Card>
      <CandidateDetailsModal 
        candidate={selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
      />
    </>
  );
}

