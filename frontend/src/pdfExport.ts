/**
 * PDF 导出：截取页面上真实渲染的 DOM 生成 PDF——前端显示什么，导出就是什么
 * （旧版走独立 HTML 模板，与页面渲染两套东西、内容对不上，已删除）
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// html2canvas 不认 SVG（recharts 图表、内联图标会截成空白），
// 截图前把克隆体里的每个 <svg> 换成 data-URL <img>（尺寸取原节点实测盒）
const inlineSvgs = (source: HTMLElement, clone: HTMLElement) => {
  const orig = Array.from(source.querySelectorAll('svg'));
  const copy = Array.from(clone.querySelectorAll('svg'));
  orig.forEach((svg, i) => {
    const target = copy[i];
    if (!target || !target.parentNode) return;
    try {
      const rect = svg.getBoundingClientRect();
      const img = document.createElement('img');
      img.src =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(new XMLSerializer().serializeToString(svg));
      img.style.width = `${Math.max(1, rect.width)}px`;
      img.style.height = `${Math.max(1, rect.height)}px`;
      target.parentNode.replaceChild(img, target);
    } catch {
      // 单个图标序列化失败不影响整图
    }
  });
};

export async function exportElementPDF(source: HTMLElement, fileName: string): Promise<void> {
  // 克隆到屏外容器，不碰页面真实节点
  const clone = source.cloneNode(true) as HTMLElement;
  inlineSvgs(source, clone);

  const container = document.createElement('div');
  container.style.cssText = `position:absolute;left:-9999px;top:0;width:${
    source.offsetWidth || 960
  }px;background:#fff;`;
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // 等 data-URL 图片解码
    await new Promise((r) => setTimeout(r, 150));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // A4 分页：整图按页高切片
    const imgWidth = 210; // A4 宽 mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 高 mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    let position = 0;
    let heightLeft = imgHeight;
    pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('PDF生成失败:', error);
    alert('PDF生成失败，请重试');
  } finally {
    document.body.removeChild(container);
  }
}
