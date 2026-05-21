import jsPDF from 'jspdf';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType,
} from 'docx';

// ── Shared helpers ────────────────────────────────────────────────────────────

function getFilename(ext) {
  const ts = new Date().toISOString().slice(0, 10);
  return `NexusAI_Report_${ts}.${ext}`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildTextContent(data) {
  const divider = '─'.repeat(60);
  const lines   = [
    '╔══════════════════════════════════════════════════════════╗',
    '║            NexusAI — Analysis Report                    ║',
    '╚══════════════════════════════════════════════════════════╝',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    divider,
    '  EXECUTIVE SUMMARY',
    divider,
    data.summary_detailed || data.executive_summary || '',
    '',
    divider,
    '  KEY POINTS',
    divider,
    ...(data.key_points?.map((p, i) => `  ${i + 1}. ${p}`) || []),
    '',
    divider,
    '  IMPORTANT INSIGHTS',
    divider,
    ...(data.important_insights?.map(ins => `  → ${ins}`) || []),
    '',
    divider,
    '  KEYWORDS',
    divider,
    `  ${data.keywords?.join('  •  ') || ''}`,
    '',
    divider,
    '  TONE ANALYSIS',
    divider,
  ];

  const ta = data.tone_analysis;
  if (ta) {
    lines.push(
      `  Overall Tone : ${ta.overall_tone}`,
      `  Sentiment    : ${ta.sentiment}`,
      `  Formality    : ${ta.formality}`,
      `  Confidence   : ${ta.confidence}`,
    );
    if (ta.sentiment_scores) {
      const s = ta.sentiment_scores;
      lines.push(
        '',
        '  Sentiment Breakdown:',
        `    Positive : ${s.positive}%`,
        `    Negative : ${s.negative}%`,
        `    Neutral  : ${s.neutral}%`,
      );
    }
  }

  lines.push('', divider, '  End of Report — NexusAI', divider);
  return lines.join('\n');
}

// ── TXT Export ────────────────────────────────────────────────────────────────

export function exportTxt(data) {
  const content = buildTextContent(data);
  const blob    = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, getFilename('txt'));
}

// ── PDF Export ────────────────────────────────────────────────────────────────

export function exportPdf(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxW   = pageW - margin * 2;
  let   y      = margin;

  // ── helpers ──
  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
  };

  const heading = (text, size = 11, color = [99, 102, 241]) => {
    checkPage(12);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, y);
    y += 2;
    // underline
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + maxW, y);
    y += 5;
  };

  const body = (text, size = 9.5, color = [200, 200, 220]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach(line => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5.5;
    });
  };

  const bullet = (text) => {
    checkPage(6);
    doc.setFontSize(9.5);
    doc.setTextColor(200, 200, 220);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxW - 8);
    doc.setFillColor(99, 102, 241);
    doc.circle(margin + 2, y - 1.5, 1, 'F');
    lines.forEach((line, i) => {
      doc.text(line, margin + 6, y);
      y += 5.5;
      if (i < lines.length - 1) checkPage(6);
    });
  };

  const gap = (n = 5) => { y += n; };

  // ── Cover header ──
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Header band
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin - 4, y - 4, maxW + 8, 28, 3, 3, 'F');
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.setFont('helvetica', 'bold');
  doc.text('NexusAI', margin + 2, y + 8);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('AI Analysis Report', margin + 2, y + 16);
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleString()}`, pageW - margin - 2, y + 16, { align: 'right' });
  y += 36;

  // ── Sections ──
  heading('Executive Summary', 11);
  body(data.summary_detailed || data.executive_summary || '');
  gap();

  if (data.key_points?.length) {
    heading('Key Points', 11);
    data.key_points.forEach(p => bullet(p));
    gap();
  }

  if (data.important_insights?.length) {
    heading('Important Insights', 11);
    data.important_insights.forEach(ins => bullet(`→  ${ins}`));
    gap();
  }

  if (data.keywords?.length) {
    heading('Keywords', 11);
    body(data.keywords.join('   •   '));
    gap();
  }

  const ta = data.tone_analysis;
  if (ta) {
    heading('Tone Analysis', 11);
    const rows = [
      ['Overall Tone', ta.overall_tone],
      ['Sentiment',    ta.sentiment],
      ['Formality',    ta.formality],
      ['Confidence',   ta.confidence],
    ];
    rows.forEach(([label, value]) => {
      checkPage(7);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184);
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      doc.text(value || '—', margin + 36, y);
      y += 6;
    });

    if (ta.sentiment_scores) {
      gap(3);
      const s = ta.sentiment_scores;
      [
        ['Positive', s.positive, [52, 211, 153]],
        ['Negative', s.negative, [248, 113, 113]],
        ['Neutral',  s.neutral,  [129, 140, 248]],
      ].forEach(([label, val, clr]) => {
        checkPage(8);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`${label}  ${val}%`, margin, y);
        // bar background
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(margin + 30, y - 3.5, maxW - 30, 4, 1, 1, 'F');
        // bar fill
        doc.setFillColor(...clr);
        const fillW = Math.max(2, ((maxW - 30) * val) / 100);
        doc.roundedRect(margin + 30, y - 3.5, fillW, 4, 1, 1, 'F');
        y += 8;
      });
    }
  }

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`NexusAI Report  ·  Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
  }

  doc.save(getFilename('pdf'));
}

// ── DOCX Export ───────────────────────────────────────────────────────────────

export async function exportDocx(data) {
  const accent = '4F46E5'; // primary indigo

  const sectionHeading = (text) =>
    new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent } },
    });

  const bodyPara = (text) =>
    new Paragraph({
      children: [new TextRun({ text, size: 22, color: '334155' })],
      spacing: { after: 120 },
    });

  const bulletPara = (text) =>
    new Paragraph({
      children: [new TextRun({ text: `• ${text}`, size: 22, color: '334155' })],
      spacing: { after: 80 },
      indent: { left: 360 },
    });

  const kv = (label, value) =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 22, color: '475569' }),
        new TextRun({ text: value || '—', size: 22, color: '1E293B' }),
      ],
      spacing: { after: 80 },
    });

  const children = [
    // Title
    new Paragraph({
      children: [
        new TextRun({ text: 'NexusAI', bold: true, size: 48, color: accent }),
        new TextRun({ text: '  Analysis Report', size: 36, color: '64748B' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, size: 18, color: '94A3B8', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),

    // Executive Summary
    sectionHeading('Executive Summary'),
    bodyPara(data.summary_detailed || data.executive_summary || ''),

    // Key Points
    ...(data.key_points?.length ? [
      sectionHeading('Key Points'),
      ...data.key_points.map(bulletPara),
    ] : []),

    // Important Insights
    ...(data.important_insights?.length ? [
      sectionHeading('Important Insights'),
      ...data.important_insights.map(ins => bulletPara(`→ ${ins}`)),
    ] : []),

    // Keywords
    ...(data.keywords?.length ? [
      sectionHeading('Keywords'),
      bodyPara(data.keywords.join('   •   ')),
    ] : []),

    // Tone Analysis
    ...(data.tone_analysis ? [
      sectionHeading('Tone Analysis'),
      kv('Overall Tone', data.tone_analysis.overall_tone),
      kv('Sentiment',    data.tone_analysis.sentiment),
      kv('Formality',    data.tone_analysis.formality),
      kv('Confidence',   data.tone_analysis.confidence),
      ...(data.tone_analysis.sentiment_scores ? [
        new Paragraph({ spacing: { before: 160 } }),
        kv('Positive', `${data.tone_analysis.sentiment_scores.positive}%`),
        kv('Negative', `${data.tone_analysis.sentiment_scores.negative}%`),
        kv('Neutral',  `${data.tone_analysis.sentiment_scores.neutral}%`),
      ] : []),
    ] : []),

    // Footer
    new Paragraph({
      children: [new TextRun({ text: 'End of Report — NexusAI', size: 18, color: '94A3B8', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 720 },
    }),
  ];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, getFilename('docx'));
}
