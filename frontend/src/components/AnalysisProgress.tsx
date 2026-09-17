import React from 'react';

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  message?: string;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  visible: boolean;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  steps,
  visible
}) => {
  if (!visible) return null;

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = (completedCount / steps.length) * 100;
  const activeStep = steps.find(s => s.status === 'active');

  return (
    <div className="analysis-progress-inline">
      <div className="progress-info-row">
        <span className="progress-step-name">
          {activeStep ? activeStep.label : '准备中...'}
        </span>
        {activeStep?.message && (
          <span className="progress-message">{activeStep.message}</span>
        )}
        <span className="progress-count">{completedCount}/{steps.length}</span>
      </div>
      <div className="progress-bar-inline">
        <div
          className="progress-fill-inline"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default AnalysisProgress;