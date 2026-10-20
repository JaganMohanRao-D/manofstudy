import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ENGINEERING_ROADMAPS } from '../data/engineeringRoadmapsData';
import { generateRoadmapPdf } from '../utils/roadmapPdfGenerator';
import { RoadmapModal } from './roadmaps/RoadmapModal';
import type { BranchRoadmap } from '../types';

interface RoadmapFullPageProps {
  branchId: string;
  onNavigateToStore?: (category?: string) => void;
}

export const RoadmapFullPage: React.FC<RoadmapFullPageProps> = ({ branchId, onNavigateToStore }) => {
  const branch: BranchRoadmap | undefined = ENGINEERING_ROADMAPS.find((item) => item.id === branchId);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportStatus, setPdfExportStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!branch) return;
    document.title = `${branch.name} Roadmap | Naa College`;
    let description = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.appendChild(description);
    }
    description.content = `Explore the ${branch.name} roadmap on Naa College, including learning stages, skills, projects, career directions and downloadable guidance.`;
  }, [branch]);

  const handleDownloadPdf = async (selectedBranch: BranchRoadmap) => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfExportStatus('generating');
    setPdfErrorMessage(null);
    try {
      await generateRoadmapPdf(selectedBranch);
      setPdfExportStatus('success');
    } catch (error) {
      setPdfExportStatus('error');
      setPdfErrorMessage(error instanceof Error ? error.message : 'PDF generation failed. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const goToRoadmaps = () => {
    window.location.assign('/engineering-roadmaps/');
  };

  if (!branch) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Roadmap not found</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">This roadmap could not be found.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">The link may be outdated. Return to the roadmaps directory to choose another branch.</p>
        <button type="button" onClick={goToRoadmaps} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
          <ArrowLeft size={16}/> Browse all roadmaps
        </button>
      </section>
    );
  }

  return (
    <div className="min-h-[70vh] w-full">
      <div className="mx-auto max-w-6xl px-0 pb-4">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-blue-700">Home</a><span aria-hidden="true">/</span>
          <a href="/engineering-roadmaps/" className="hover:text-blue-700">Roadmaps</a><span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-slate-800">{branch.name}</span>
        </nav>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-700"><BookOpen size={20}/></span>
            <div><p className="text-sm font-bold text-slate-900">Your roadmap, all in one place</p><p className="text-xs leading-5 text-slate-600">Read the complete guide below. No pop-up or modal window.</p></div>
          </div>
          <button type="button" onClick={goToRoadmaps} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100">
            <ArrowLeft size={15}/> All roadmaps
          </button>
        </div>
      </div>
      <RoadmapModal
        branch={branch}
        isOpen={true}
        fullPage={true}
        onClose={goToRoadmaps}
        onDownloadPdf={handleDownloadPdf}
        isExportingPdf={isExportingPdf}
        pdfExportStatus={pdfExportStatus}
        pdfErrorMessage={pdfErrorMessage}
        onNavigateToStore={onNavigateToStore}
      />
    </div>
  );
};

export default RoadmapFullPage;
