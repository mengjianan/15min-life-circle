import React from 'react';

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  message = '加载中...'
}) => {
  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-message">{message}</p>
        <p className="loading-submessage">
          正在调用百度地图API计算等时圈...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
