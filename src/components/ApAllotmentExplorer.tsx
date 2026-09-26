import React from 'react';
import APAllotmentExplorerComponent from './ap-allotment/APAllotmentExplorer';

export interface ApAllotmentExplorerProps {
  initialCollegeCode?: string;
  initialBranchCode?: string;
  initialTab?: 'college' | 'student-search' | 'rank-search';
  onNavigateToTab?: (tabId: string) => void;
}

export const ApAllotmentExplorer: React.FC<ApAllotmentExplorerProps> = (props) => {
  return <APAllotmentExplorerComponent {...props} />;
};

export default ApAllotmentExplorer;
