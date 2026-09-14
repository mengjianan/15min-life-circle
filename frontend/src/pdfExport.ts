/**
 * PDF/打印报告导出工具
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { AnalysisResult, MultiTimeData } from './types';

/**
 * 生成可打印的报告HTML
 */
export function generatePrintableReport(
  reportData: AnalysisResult,
  multiTimeData?: MultiTimeData | null
): string {
  const { community_name, score, suggestions, blind_spots } = reportData;

  // 生成各类设施评分HTML
  const categoryScoresHTML = Object.entries(score.categories)
    .map(([category, categoryScore]) => {
      const numScore = categoryScore as number;
      const barColor = numScore >= 80 ? '#52c41a' : numScore >= 60 ? '#1890ff' : '#faad14';

      return `
        <div class="category-item">
          <span class="category-name">${category}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${numScore}%; background-color: ${barColor}"></div>
          </div>
          <span class="category-score">${numScore}分</span>
        </div>
      `;
    })
    .join('');

  // 生成建议HTML
  const suggestionsHTML = suggestions
    .map(suggestion => `
      <div class="suggestion-item ${suggestion.priority === '高' ? 'high-priority' : ''}">
        <span class="suggestion-priority">[${suggestion.priority}]</span>
        <span class="suggestion-category">${suggestion.category}</span>
        <span class="suggestion-message">${suggestion.message}</span>
      </div>
    `)
    .join('');

  // 生成盲区HTML
  const blindSpotsHTML = blind_spots.length > 0
    ? blind_spots
        .map(spot => `
          <div class="blind-spot-item">
            <span class="spot-icon">⚠️</span>
            <span class="spot-category">${spot.category}:</span>
            <span class="spot-description">${spot.description}</span>
          </div>
        `)
        .join('')
    : '<p class="no-spots">✅ 未发现明显服务盲区</p>';

  // 多时间数据HTML
  let multiTimeHTML = '';
  if (multiTimeData && multiTimeData.layers) {
    const layersHTML = multiTimeData.layers
      .map(layer => `
        <div class="time-layer-item">
          <span class="layer-time">${layer.time_text}</span>
          <span class="layer-area">${(layer.area / 1000000).toFixed(2)} km²</span>
        </div>
      `)
      .join('');

    multiTimeHTML = `
      <div class="section">
        <h2>⏱️ 多时间维度分析</h2>
        <div class="time-layers">${layersHTML}</div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${community_name} - 15分钟生活圈体检报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #ffffff;
      padding: 20px;
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }

    .report-header {
      background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .report-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .report-header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .score-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 30px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1890ff, #722ed1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .score-number {
      font-size: 48px;
      font-weight: bold;
      line-height: 1;
    }

    .score-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .score-info {
      text-align: left;
    }

    .score-level {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .score-detail {
      font-size: 14px;
      color: #666;
    }

    .section {
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1890ff;
    }

    .category-item {
      display: flex;
      align-items: center;
      margin: 12px 0;
      padding: 8px 0;
    }

    .category-name {
      width: 80px;
      font-weight: 500;
      color: #666;
    }

    .category-bar-container {
      flex: 1;
      height: 20px;
      background: #e8e8e8;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 15px;
    }

    .category-bar {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .category-score {
      width: 60px;
      text-align: right;
      font-weight: 600;
      color: #333;
    }

    .suggestion-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #f6ffed;
      border-left: 4px solid #52c41a;
      border-radius: 0 4px 4px 0;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .suggestion-item.high-priority {
      background: #fff1f0;
      border-left-color: #ff4d4f;
    }

    .suggestion-priority {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .suggestion-category {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .suggestion-message {
      color: #666;
    }

    .blind-spot-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #fff7e6;
      border-left: 4px solid #faad14;
      border-radius: 0 4px 4px 0;
    }

    .spot-icon {
      margin-right: 8px;
    }

    .spot-category {
      font-weight: 600;
      color: #333;
      margin-right: 8px;
    }

    .spot-description {
      color: #666;
    }

    .no-spots {
      color: #52c41a;
      font-weight: 500;
    }

    .time-layers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .time-layer-item {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }

    .layer-time {
      display: block;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 8px;
    }

    .layer-area {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .report-footer {
      padding: 20px 30px;
      background: #fafafa;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .report-container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <h1>🏘️ 15分钟生活圈体检报告</h1>
      <p>${community_name}</p>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-number">${score.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${score.level}</div>
        <div class="score-detail">盲区扣分: -${score.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString('zh-CN')}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${categoryScoresHTML}
    </div>

    ${multiTimeHTML}

    <div class="section">
      <h2>💡 改善建议</h2>
      ${suggestionsHTML}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${blindSpotsHTML}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 导出PDF报告（直接下载）
 */
export async function exportPDFReport(
  reportData: AnalysisResult,
  multiTimeData?: MultiTimeData | null
): Promise<void> {
  // 创建临时容器
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.innerHTML = generatePrintableReport(reportData, multiTimeData);
  document.body.appendChild(container);

  try {
    // 使用html2canvas生成canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 计算PDF尺寸
    const imgWidth = 210; // A4宽度(mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4高度(mm)

    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    let heightLeft = imgHeight;

    // 添加第一页
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 下载PDF
    const fileName = `${reportData.community_name}_15分钟生活圈体检报告.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF生成失败:', error);
    alert('PDF生成失败，请重试');
  } finally {
    // 清理临时容器
    document.body.removeChild(container);
  }
}

/**
 * 下载HTML报告文件
 */
export function downloadHTMLReport(
  reportData: AnalysisResult,
  multiTimeData?: MultiTimeData | null
): void {
  const reportHTML = generatePrintableReport(reportData, multiTimeData);

  const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.community_name}_15分钟生活圈体检报告.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
