import React from 'react';
// @ts-ignore
import { SlideOverDrawer } from './SlideOverDrawer';
import { WorkspaceView } from '../types';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (ws: WorkspaceView, subTab?: string) => void;
  onOpenSupport?: () => void;
  onOpenFeedback?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = (props) => {
  return <SlideOverDrawer {...props} />;
};

export default NavigationDrawer;
