import React from 'react';
// @ts-ignore
import { HeroSection as HeroSectionComponent } from './HeroSection.jsx';
import { WorkspaceView } from '../types';

export interface HeroSectionProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = (props) => {
  return <HeroSectionComponent {...props} />;
};

export default HeroSection;

