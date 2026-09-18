import React from 'react';
// @ts-ignore
import { FeaturesHub as FeaturesHubComponent, WORKSPACES as WORKSPACES_DATA } from './FeaturesHub.jsx';
import { WorkspaceView } from '../types';

export interface FeaturesHubProps {
  activeWorkspace?: WorkspaceView;
  onSelectWorkspace?: (ws: WorkspaceView) => void;
}

export const WORKSPACES = WORKSPACES_DATA;

export const FeaturesHub: React.FC<FeaturesHubProps> = (props) => {
  return <FeaturesHubComponent {...props} />;
};

export default FeaturesHub;
