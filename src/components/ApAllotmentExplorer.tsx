import React from 'react';
import APAllotmentExplorer, { APAllotmentExplorerProps } from './ap-allotment/APAllotmentExplorer';

export { APAllotmentExplorer };
export type { APAllotmentExplorerProps as ApAllotmentExplorerProps };

export const ApAllotmentExplorer: React.FC<APAllotmentExplorerProps> = (props) => {
  return <APAllotmentExplorer {...props} />;
};

export default ApAllotmentExplorer;
