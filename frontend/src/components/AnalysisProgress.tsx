import React from 'react';

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
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

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'active':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
    }
  };

  return (
    <div className="analysis-progress">
      <div className="progress-card">
        <div className="progress-header">
          <h3>正在分析中</h3>
          <p>请稍候，正在为您生成生活圈体检报告...</p>
        </div>

        <div className="progress-steps">
          {steps.map(step => (
            <div
              key={step.id}
              className={`progress-step ${step.status}`}
            >
              <div className="step-icon">
                {getStepIcon(step.status)}
              </div>
              <span className="step-text">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
