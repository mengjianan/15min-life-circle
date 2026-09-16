import React, { useState } from 'react';

interface CustomCenterProps {
  onCenterSelect: (lng: number, lat: number) => void;
  currentCenter: { lng: number; lat: number; name: string } | null;
  onClose: () => void;
}

const CustomCenter: React.FC<CustomCenterProps> = ({
  onCenterSelect,
  currentCenter,
  onClose
}) => {
  const [lng, setLng] = useState(currentCenter?.lng?.toString() || '118.7784');
  const [lat, setLat] = useState(currentCenter?.lat?.toString() || '32.0663');
  const [name, setName] = useState(currentCenter?.name || '自定义位置');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lngNum = parseFloat(lng);
    const latNum = parseFloat(lat);

    if (isNaN(lngNum) || isNaN(latNum)) {
      alert('请输入有效的经纬度');
      return;
    }

    if (lngNum < 73 || lngNum > 135 || latNum < 3 || latNum > 53) {
      alert('经纬度超出中国范围');
      return;
    }

    onCenterSelect(lngNum, latNum);
    onClose();
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setLng(longitude.toFixed(6));
          setLat(latitude.toFixed(6));
          setName('当前位置');
          onCenterSelect(longitude, latitude);
          onClose();
        },
        (error) => {
          alert('无法获取当前位置，请手动输入');
          console.error('获取位置失败:', error);
        }
      );
    } else {
      alert('浏览器不支持地理定位');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
            </svg>
            自定义中心点
          </h4>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>经度:</label>
            <input
              type="number"
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="118.7784"
            />
          </div>

          <div className="form-group">
            <label>纬度:</label>
            <input
              type="number"
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="32.0663"
            />
          </div>

          <div className="form-group">
            <label>名称:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="自定义位置"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="apply-button">
              应用
            </button>
            <button
              type="button"
              className="location-button"
              onClick={handleGetCurrentLocation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
              获取当前位置
            </button>
          </div>
        </form>

        {currentCenter && (
          <div className="current-info">
            <p>当前中心点:</p>
            <p className="center-name">{currentCenter.name}</p>
            <p className="center-coord">
              ({currentCenter.lng.toFixed(4)}, {currentCenter.lat.toFixed(4)})
            </p>
          </div>
        )}

        <div className="preset-locations">
          <h5>预设位置</h5>
          <div className="preset-list">
            {[
              { name: '南京市中心', lng: 118.7969, lat: 32.0603 },
              { name: '新街口', lng: 118.7874, lat: 32.0423 },
              { name: '鼓楼广场', lng: 118.7784, lat: 32.0663 },
              { name: '夫子庙', lng: 118.7894, lat: 32.0233 },
            ].map((preset) => (
              <button
                key={preset.name}
                className="preset-button"
                onClick={() => {
                  setLng(preset.lng.toString());
                  setLat(preset.lat.toString());
                  setName(preset.name);
                  onCenterSelect(preset.lng, preset.lat);
                  onClose();
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCenter;
