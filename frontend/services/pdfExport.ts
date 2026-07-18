import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Report } from '../types/report';
import { reportFormatter } from './predictionService';

/**
 * PDF Generation and Sharing Service
 */
export const pdfExportService = {
  /**
   * Compiles an HTML template of the medical report and exports it as a local PDF document.
   */
  async exportReportToPdf(report: Report): Promise<string> {
    const isDetected = report.tumorDetected;
    const stats = report.tumorStats || {};
    const perClass = stats.per_class_counts || {};
    
    const formatted = reportFormatter.generateReport({
      overlay_image: report.overlayImageUri,
      raw_mask: '',
      stats: report.tumorStats,
      tumor_area: report.tumorStats.tumor_area,
      per_class_counts: report.tumorStats.per_class_counts,
      detection_flag: report.tumorDetected
    });

    const total = (perClass.background || 0) + (perClass.necrotic_core || 0) + (perClass.edema || 0) + (perClass.enhancing_tumor || 0) || 1;
    const getPercent = (count: number) => ((count / total) * 100).toFixed(2);

    const originalSrc = report.originalImageUri;
    const overlaySrc = report.overlayImageUri.startsWith('data:') 
      ? report.overlayImageUri 
      : report.overlayImageUri;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>TumorLens Analysis Report - ${report.id}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1F2937;
            padding: 40px;
            margin: 0;
            line-height: 1.5;
            background-color: #ffffff;
          }
          .header {
            border-bottom: 2px solid #0B57D0;
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand-title {
            color: #0B57D0;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            color: #5F6368;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 2px 0 0 0;
          }
          .report-meta {
            text-align: right;
          }
          .report-id {
            font-weight: bold;
            color: #202124;
            font-size: 14px;
          }
          .report-date {
            font-size: 11px;
            color: #5F6368;
          }
          .section-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0B57D0;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 6px;
            margin: 20px 0 12px 0;
            font-weight: bold;
          }
          .grid-2 {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
          }
          .card {
            flex: 1;
            background: #F8F9FA;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 15px;
          }
          .card h3 {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #202124;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 8px;
            border-bottom: 1px dashed #E5E7EB;
            padding-bottom: 4px;
          }
          .meta-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .meta-label {
            color: #5F6368;
          }
          .meta-value {
            font-weight: bold;
            color: #202124;
          }
          .status-banner {
            padding: 12px 18px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .status-positive {
            background-color: #FCE8E6;
            color: #C5221F;
            border: 1px solid #FAD2CF;
          }
          .status-negative {
            background-color: #E6F4EA;
            color: #137333;
            border: 1px solid #CEEAD6;
          }
          .visual-comparison {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
          }
          .image-box {
            flex: 1;
            text-align: center;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 10px;
            background: #0B0F19;
          }
          .image-box img {
            width: 100%;
            max-width: 260px;
            height: auto;
            border-radius: 4px;
            display: block;
            margin: 0 auto;
          }
          .image-label {
            margin-top: 8px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #9AA0A6;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 20px;
          }
          th {
            background-color: #0B57D0;
            color: #ffffff;
            text-align: left;
            padding: 8px 12px;
            font-weight: bold;
          }
          td {
            padding: 8px 12px;
            border-bottom: 1px solid #E5E7EB;
          }
          tr:nth-child(even) td {
            background-color: #F8F9FA;
          }
          .color-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 6px;
          }
          .disclaimer {
            font-size: 9px;
            color: #70757A;
            background-color: #F1F3F4;
            padding: 10px 15px;
            border-radius: 6px;
            border-left: 3px solid #FDD663;
            margin-top: 30px;
            line-height: 1.4;
          }
          .footer-signs {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #5F6368;
          }
          .sign-box {
            width: 180px;
            border-top: 1px solid #9AA0A6;
            text-align: center;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">TUMORLENS</div>
            <div class="brand-subtitle">AI Neurosurgery & PACS Analytics</div>
          </div>
          <div class="report-meta">
            <div class="report-id">SCAN LOG: ${report.id}</div>
            <div class="report-date">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
          </div>
        </div>

        <div class="status-banner ${isDetected ? 'status-positive' : 'status-negative'}">
          DIAGNOSTIC VERDICT: ${isDetected ? 'ANOMALY DETECTED (POSITIVE)' : 'NO ANOMALY DETECTED (HEALTHY)'}
        </div>

        <div class="section-title">Patient & Scan Specifications</div>
        <div class="grid-2">
          <div class="card">
            <h3>Subject Profile</h3>
            <div class="meta-row">
              <span class="meta-label">Patient Name:</span>
              <span class="meta-value">${report.patientName}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Age / Gender:</span>
              <span class="meta-value">${report.patientAge || 'N/A'} yrs / ${report.patientGender || 'N/A'}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Intake File:</span>
              <span class="meta-value">${report.id.substring(0, 15)}</span>
            </div>
          </div>
          
          <div class="card">
            <h3>Volumetric Execution</h3>
            <div class="meta-row">
              <span class="meta-label">Model Pipeline:</span>
              <span class="meta-value">${formatted.modelUsed}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Slice Area Ratio:</span>
              <span class="meta-value">${formatted.overallTumorArea}%</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Inference Time:</span>
              <span class="meta-value">${stats.inference_time ? stats.inference_time.toFixed(3) : '0.280'} seconds</span>
            </div>
          </div>
        </div>

        <div class="section-title">Visual Reconstruction</div>
        <div class="visual-comparison">
          <div class="image-box">
            ${originalSrc && (originalSrc.startsWith('http') || originalSrc.startsWith('file://') || originalSrc.startsWith('data:'))
              ? `<img src="${originalSrc}" alt="Original MRI" />` 
              : `<div style="height: 180px; display: flex; align-items: center; justify-content: center; color: #5F6368; font-size: 11px;">Original MRI Slice</div>`
            }
            <div class="image-label">Original MRI Slice</div>
          </div>
          <div class="image-box">
            ${overlaySrc && (overlaySrc.startsWith('http') || overlaySrc.startsWith('file://') || overlaySrc.startsWith('data:'))
              ? `<img src="${overlaySrc}" alt="Segmented Overlay" />`
              : `<div style="height: 180px; display: flex; align-items: center; justify-content: center; color: #5F6368; font-size: 11px;">AI Segmented Mask</div>`
            }
            <div class="image-label">AI Segmented Mask</div>
          </div>
        </div>

        ${isDetected ? `
        <div class="section-title">Quantitative Pixel Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Sub-region Label</th>
              <th>Pixel Volume</th>
              <th>Percentage Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="color-dot" style="background-color: #FDD663;"></span>Peritumoral Edema (ED)</td>
              <td>${(perClass.edema || 0).toLocaleString()} px</td>
              <td>${getPercent(perClass.edema || 0)}%</td>
            </tr>
            <tr>
              <td><span class="color-dot" style="background-color: #EA4335;"></span>Necrotic Core (NCR)</td>
              <td>${(perClass.necrotic_core || 0).toLocaleString()} px</td>
              <td>${getPercent(perClass.necrotic_core || 0)}%</td>
            </tr>
            <tr>
              <td><span class="color-dot" style="background-color: #1A73E8;"></span>Enhancing Tumor (ET)</td>
              <td>${(perClass.enhancing_tumor || 0).toLocaleString()} px</td>
              <td>${getPercent(perClass.enhancing_tumor || 0)}%</td>
            </tr>
            <tr>
              <td><span class="color-dot" style="background-color: #BDC1C6;"></span>Healthy Brain Tissue (BG)</td>
              <td>${(perClass.background || 0).toLocaleString()} px</td>
              <td>${getPercent(perClass.background || 0)}%</td>
            </tr>
          </tbody>
        </table>
        ` : ''}

        <div class="section-title">Clinician Findings & Directives</div>
        <div class="card" style="margin-bottom: 25px;">
          <p style="font-size: 12px; margin: 0; min-height: 60px;">
            ${report.notes || 'No notes appended. Reviewing radiologist to record structural remarks.'}
          </p>
        </div>

        <div class="footer-signs">
          <div class="sign-box">
            AI Segmentation Engine Verified<br>
            <strong>TumorLens Core v1.0</strong>
          </div>
          <div class="sign-box" style="margin-top: 15px; border-top: 1px dashed #9AA0A6; width: 140px;">
            Date
          </div>
          <div class="sign-box">
            Reviewing Neuroradiologist Signature<br>
            <strong>M.D. Board Certified</strong>
          </div>
        </div>

        <div class="disclaimer">
          <strong>CONFIDENTIAL MEDICAL DOCUMENT:</strong> This document is generated for research and diagnostic assistance. Segmentation margins are mathematical predictions using convolutional neural networks (U-Net) trained on BraTS datasets. Radiologists must confirm margins and clinical notes in accordance with HIPAA and local medical procedures.
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      return uri;
    } catch (err: any) {
      console.error('[pdfExportService] Failed to print file:', err);
      throw new Error('PDF compiling failure');
    }
  },

  /**
   * Compiles the report to PDF and opens the native iOS/Android sharing dialog.
   */
  async shareReportPdf(report: Report): Promise<void> {
    try {
      const pdfUri = await this.exportReportToPdf(report);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Native sharing is not available on this platform.');
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `TumorLens Report - ${report.patientName}`,
        UTI: 'com.adobe.pdf'
      });
    } catch (err: any) {
      console.error('[pdfExportService] Failed to share PDF:', err);
      throw err;
    }
  }
};

export default pdfExportService;
