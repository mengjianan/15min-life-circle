import React, { useState } from 'react';

interface CustomCenterProps {
  onCenterSelect: (lng: number, lat: number) => void;
  currentCenter: { lng: number; lat: number; name: string } | null;
}

const CustomCenter: React.FC<CustomCenterProps> = ({
  onCenterSelect,
  currentCenter
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
    <div className="custom-center">
      <h4>📍 自定义中心点</h4>

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
            📱 获取当前位置
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
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomCenter;
