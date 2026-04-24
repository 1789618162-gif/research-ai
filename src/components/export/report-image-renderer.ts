import type {
  PositioningMap,
  ReportTemplate,
} from "@/components/export/report-template";

const width = 1280;
const cardX = 40;
const cardY = 40;
const padding = 72;
const contentWidth = width - padding * 2;
const mapHeight = 380;
const inkStrong = "#404040";
const inkMedium = "#737373";
const inkMuted = "#8a8a8a";
const inkSoft = "#a3a3a3";

function setFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
) {
  context.font = `${weight} ${size}px Arial, Microsoft YaHei, sans-serif`;
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const characters = Array.from(text);
  const lines: string[] = [];
  let line = "";

  characters.forEach((character) => {
    const nextLine = `${line}${character}`;

    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = character;
      return;
    }

    line = nextLine;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function textBlockHeight(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
) {
  return wrapText(context, text, maxWidth).length * lineHeight;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = wrapText(context, text, maxWidth);
  let currentY = y;

  lines.forEach((line) => {
    context.fillText(line, x, currentY);
    currentY += lineHeight;
  });

  return currentY;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + rectWidth - radius, y);
  context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
  context.lineTo(x + rectWidth, y + rectHeight - radius);
  context.quadraticCurveTo(
    x + rectWidth,
    y + rectHeight,
    x + rectWidth - radius,
    y + rectHeight,
  );
  context.lineTo(x + radius, y + rectHeight);
  context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function measureTemplateHeight(
  context: CanvasRenderingContext2D,
  template: ReportTemplate,
) {
  let height = 128;

  setFont(context, 700, 44);
  height += textBlockHeight(context, template.title, contentWidth, 56);
  setFont(context, 400, 24);
  height += textBlockHeight(context, template.subtitle, contentWidth, 34);
  height += textBlockHeight(context, template.audienceNote, contentWidth, 36);
  height += 34 + template.metadata.length * 30 + 54;

  if (template.sections.length === 0) {
    return height + 220;
  }

  template.sections.forEach((section) => {
    height += 42;
    setFont(context, 700, 30);
    height += textBlockHeight(context, section.title, contentWidth, 40);
    setFont(context, 400, 22);
    height += textBlockHeight(context, section.summary, contentWidth, 34) + 18;

    if (section.id === "positioning-map") {
      height += mapHeight + 30;
    }

    setFont(context, 400, 21);
    section.points.forEach((point) => {
      height += textBlockHeight(context, `- ${point}`, contentWidth - 20, 31) + 6;
    });
    height += 34;
  });

  return height + 82;
}

function drawPositioningMap(
  context: CanvasRenderingContext2D,
  map: PositioningMap,
  x: number,
  y: number,
  rectWidth: number,
) {
  const plotX = x + 56;
  const plotY = y + 40;
  const plotWidth = rectWidth - 112;
  const plotHeight = mapHeight - 96;

  context.fillStyle = "#fafafa";
  roundedRect(context, x, y, rectWidth, mapHeight, 10);
  context.fill();
  context.strokeStyle = "#d4d4d4";
  context.lineWidth = 2;
  context.stroke();

  context.strokeStyle = "#d4d4d4";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(plotX, plotY + plotHeight / 2);
  context.lineTo(plotX + plotWidth, plotY + plotHeight / 2);
  context.moveTo(plotX + plotWidth / 2, plotY);
  context.lineTo(plotX + plotWidth / 2, plotY + plotHeight);
  context.stroke();

  context.fillStyle = inkSoft;
  setFont(context, 700, 16);
  context.fillText(map.quadrants.topLeft, x + 24, y + 30);
  context.fillText(map.quadrants.topRight, x + rectWidth - 126, y + 30);
  context.fillText(map.quadrants.bottomLeft, x + 24, y + mapHeight - 22);
  context.fillText(map.quadrants.bottomRight, x + rectWidth - 112, y + mapHeight - 22);

  setFont(context, 700, 18);
  context.fillStyle = inkMedium;
  context.fillText(map.xAxis, x + rectWidth / 2 - 68, y + mapHeight - 40);
  context.save();
  context.translate(x + 26, y + mapHeight / 2 + 70);
  context.rotate(-Math.PI / 2);
  context.fillText(map.yAxis, 0, 0);
  context.restore();

  map.points.forEach((point) => {
    const pointX = plotX + (point.x / 100) * plotWidth;
    const pointY = plotY + ((100 - point.y) / 100) * plotHeight;

    context.fillStyle = point.name.includes("Agent") ? "#047857" : "#525252";
    context.beginPath();
    context.arc(pointX, pointY, point.name.includes("Agent") ? 11 : 8, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ffffff";
    context.lineWidth = 3;
    context.stroke();

    context.fillStyle = inkStrong;
    setFont(context, 700, 16);
    context.fillText(point.name, pointX + 14, pointY - 4);
    context.fillStyle = inkMuted;
    setFont(context, 400, 14);
    context.fillText(point.note, pointX + 14, pointY + 18);
  });
}

function drawReportImage(template: ReportTemplate) {
  const measuringCanvas = document.createElement("canvas");
  const measuringContext = measuringCanvas.getContext("2d");

  if (!measuringContext) {
    throw new Error("当前浏览器无法生成报告图片。");
  }

  const height = Math.ceil(measureTemplateHeight(measuringContext, template));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("当前浏览器无法生成报告图片。");
  }

  canvas.width = width;
  canvas.height = height;

  context.fillStyle = "#f7f8f5";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  roundedRect(context, cardX, cardY, width - cardX * 2, height - cardY * 2, 18);
  context.fill();
  context.strokeStyle = "#d4d4d4";
  context.lineWidth = 2;
  context.stroke();

  let y = 112;

  context.fillStyle = "#047857";
  setFont(context, 700, 24);
  context.fillText(`${template.reportType.badge} report`, padding, y);

  context.fillStyle = inkStrong;
  setFont(context, 700, 44);
  y = drawWrappedText(context, template.title, padding, y + 62, contentWidth, 56);

  context.fillStyle = inkMedium;
  setFont(context, 400, 24);
  y = drawWrappedText(context, template.subtitle, padding, y + 12, contentWidth, 34);
  y = drawWrappedText(context, template.audienceNote, padding, y + 8, contentWidth, 36);

  context.strokeStyle = "#d4d4d4";
  context.beginPath();
  context.moveTo(padding, y + 26);
  context.lineTo(width - padding, y + 26);
  context.stroke();
  y += 68;

  context.fillStyle = inkMedium;
  setFont(context, 400, 20);
  template.metadata.forEach((item) => {
    context.fillText(item, padding, y);
    y += 30;
  });
  y += 28;

  if (template.sections.length === 0) {
    context.fillStyle = inkMuted;
    setFont(context, 400, 24);
    drawWrappedText(
      context,
      "尚未选择报告内容。勾选内容模块后，这里会生成完整报告图片。",
      padding,
      y + 30,
      contentWidth,
      36,
    );
    return canvas;
  }

  template.sections.forEach((section) => {
    context.strokeStyle = "#e5e5e5";
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
    y += 42;

    context.fillStyle = "#047857";
    setFont(context, 700, 18);
    context.fillText(section.eyebrow, padding, y);
    y += 34;

    context.fillStyle = inkStrong;
    setFont(context, 700, 30);
    y = drawWrappedText(context, section.title, padding, y, contentWidth, 40);

    context.fillStyle = inkMedium;
    setFont(context, 400, 22);
    y = drawWrappedText(context, section.summary, padding, y + 10, contentWidth, 34);
    y += 22;

    if (section.id === "positioning-map") {
      drawPositioningMap(context, template.positioningMap, padding, y, contentWidth);
      y += mapHeight + 28;
    }

    context.fillStyle = inkMedium;
    setFont(context, 400, 21);
    section.points.forEach((point) => {
      y = drawWrappedText(context, `- ${point}`, padding + 8, y, contentWidth - 16, 31);
      y += 6;
    });
    y += 34;
  });

  return canvas;
}

export function renderReportImageDataUrl(template: ReportTemplate) {
  return drawReportImage(template).toDataURL("image/png");
}

export async function renderReportImageBlob(template: ReportTemplate) {
  const canvas = drawReportImage(template);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("图片生成失败，请稍后重试。"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}
