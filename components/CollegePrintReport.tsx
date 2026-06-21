"use client";

import React, { useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Cutoff {
  Category: string;
  Rank: string;
  Score: string;
}

interface College {
  [key: string]: any;
  "College Code": string;
  "College Name": string;
  "Choice Code": string;
  "Course Name": string;
  Cutoffs?: Cutoff[];
  City: string;
  Status: string;
}

interface CollegePrintReportProps {
  colleges: College[];
  category?: string;
  studentName?: string;
  scoreLabel?: string;
  branch?: string;
  city?: string;
  onClose?: () => void;
}

// ─── SVG Icons (inline, print-safe) ──────────────────────────────────────────
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" style={{ display: "inline" }}>
    <path d="M12 3L1 9l4 2.18V18l7 4 7-4v-6.82L23 9l-11-6zm0 2.18L20.53 9 12 13.09 3.47 9 12 5.18zm6 9.29L12 17.91l-6-3.44v-3.82l6 3.27 6-3.27v3.82z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ─── SVG Icon Strings for HTML/Print ──────────────────────────────────────────
const PhoneIconNoMargin = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>`;

const MailIconNoMargin = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>`;

const GlobeIconNoMargin = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>`;

const WhatsAppIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>`;

const InstagramIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>`;

const FacebookIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>`;

const LinkedInIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CollegePrintReport({
  colleges,
  category,
  studentName,
  scoreLabel,
  branch,
  city,
  onClose,
}: CollegePrintReportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const PHONE = "+91 87678 84789";
  const EMAIL = "diplomatwodegree@gmail.com";
  const WEBSITE = "www.diploma2degree.co.in";
  const SOCIAL = [
    { svg: WhatsAppIconSvg, label: "WhatsApp Group", url: "https://chat.whatsapp.com/LTcuLVPipunFPjodf2ifkl", color: "#25D366" },
    { svg: InstagramIconSvg, label: "Instagram", url: "https://www.instagram.com/diploma_2_degree", color: "#E1306C" },
    { svg: FacebookIconSvg, label: "Facebook", url: "https://www.facebook.com/share/163fQuaUqb/", color: "#1877F2" },
    { svg: LinkedInIconSvg, label: "LinkedIn", url: "https://www.linkedin.com/company/diploma2degree", color: "#0A66C2" },
  ];

  // Convert the logo PNG to base64 so it works in the print window
  const logoIconSrc = "/Web Images/d2d-logo1.png";
  const logoTextSrc = "/Web Images/d2d-logo2.png";

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open("", "_blank", "width=960,height=800");
    if (!win) return;

    // We need to inline the logos as absolute URLs
    const origin = window.location.origin;

    const socialHTML = SOCIAL.map(s => `
      <div style="margin-bottom:6px;">
        <a href="${s.url}" target="_blank"
           style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:${s.color};text-decoration:none;font-weight:600;">
          ${s.svg}
          <span>${s.label}</span>
        </a>
      </div>
    `).join("");

    const contactHTML = `
      <div style="font-size:12px;color:#94a3b8;margin-bottom:5px;display:flex;align-items:center;">
        ${PhoneIconNoMargin} <a href="tel:${PHONE.replace(/\s+/g, "")}" style="color:#94a3b8;text-decoration:none;">${PHONE}</a>
      </div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:5px;display:flex;align-items:center;">
        ${MailIconNoMargin} <a href="mailto:${EMAIL}" style="color:#94a3b8;text-decoration:none;">${EMAIL}</a>
      </div>
      <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center;">
        ${GlobeIconNoMargin} <a href="https://${WEBSITE}" target="_blank" style="color:#94a3b8;text-decoration:none;">${WEBSITE}</a>
      </div>
    `;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Diploma2Degree College Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
            a { color: inherit; }
            @page { size: A4; margin: 12mm 10mm; }
          </style>
        </head>
        <body>
          <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%);margin:20px 36px 0;border-radius:16px;overflow:hidden;position:relative;">
            <div style="height:4px;background:#f97316;"></div>
            <div style="padding:20px 24px 16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:14px;">
                  <img src="${origin}${logoIconSrc}" alt="D2D Logo" style="height:48px;width:48px;border-radius:14px;object-fit:contain;background:rgba(255,255,255,0.12);padding:4px;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                  <div>
                    <h1 style="font-size:24px;font-weight:850;color:#fff;margin:0;line-height:1.2;letter-spacing:-0.5px;">Diploma2Degree</h1>
                    <span style="display:inline-block;background:#c6f6d5;color:#1c643b;font-size:9px;font-weight:800;padding:2px 8px;border-radius:9999px;margin-top:4px;letter-spacing:0.5px;text-transform:uppercase;">Maharashtra's #1 DSE Platform</span>
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:9px;color:#c7d2fe;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:2px;">Generated on</div>
                  <div style="font-size:14px;color:#fff;font-weight:800;">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
                </div>
              </div>
              
              <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:20px 24px;margin-bottom:20px;position:relative;overflow:hidden;">
                <div style="position:absolute;right:-10px;top:-10px;opacity:0.07;color:#fff;pointer-events:none;">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </div>

                <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
                  <div style="background:#f59e0b; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(245,158,11,0.3);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.2px;">10,000+ Students Got Their Dream College!</div>
                    <div style="font-size:12px;color:#c7d2fe;margin-top:4px;line-height:1.5;">Maharashtra's #1 DSE Counselling Platform — helping diploma students transition smoothly into degree engineering.</div>
                  </div>
                </div>
                
                <div style="border-top:1px solid rgba(255,255,255,0.12);padding-top:14px;display:flex;flex-direction:column;gap:12px;">
                  <div>
                    <div style="font-size:10px;text-transform:uppercase;color:#fbbf24;font-weight:800;letter-spacing:0.8px;margin-bottom:8px;">Our 100% Free Tools & Features</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px 12px;">
                      <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:9999px;font-size:11px;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
                        <span style="background:#10b981;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:800;line-height:1;">✔</span> College Predictor
                      </span>
                      <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:9999px;font-size:11px;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
                        <span style="background:#10b981;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:800;line-height:1;">✔</span> Cutoff Rank Finder
                      </span>
                      <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:9999px;font-size:11px;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
                        <span style="background:#10b981;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:800;line-height:1;">✔</span> Personalized Option Form
                      </span>
                      <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);padding:6px 14px;border-radius:9999px;font-size:11px;color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
                        <span style="background:#10b981;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:#fff;font-weight:800;line-height:1;">✔</span> Counselling Alerts
                      </span>
                    </div>
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px;">
                    <div style="background:#fff;padding:10px 18px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05);max-width:280px;flex:1 1 200px;">
                      <div style="font-size:10px;color:#64748b;font-weight:600;margin-bottom:2px;">Want to generate your own report?</div>
                      <a href="https://${WEBSITE}" target="_blank" style="font-size:13px;color:#7c3aed;font-weight:800;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">Visit ${WEBSITE} <span style="font-size:14px;">➔</span></a>
                    </div>
                    <div style="background:#fff;padding:10px 18px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05);max-width:280px;flex:1 1 200px;">
                      <div style="font-size:10px;color:#64748b;font-weight:600;margin-bottom:2px;">Download our Android App</div>
                      <a href="https://play.google.com/store/apps/details?id=com.d2d.diploma2degree&pcampaignid=web_share" target="_blank" style="font-size:13px;color:#0d9488;font-weight:800;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">Get it on Google Play <span style="font-size:14px;">➔</span></a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="display:flex;flex-wrap:wrap;gap:14px 24px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1);">
                <a href="tel:${PHONE.replace(/\s+/g, "")}" style="display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#fff;font-weight:700;text-decoration:none;">
                  <span style="background:rgba(255,255,255,0.12);width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;">
                    ${PhoneIconNoMargin}
                  </span>
                  ${PHONE}
                </a>
                <a href="mailto:${EMAIL}" style="display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#fff;font-weight:700;text-decoration:none;">
                  <span style="background:rgba(255,255,255,0.12);width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;">
                    ${MailIconNoMargin}
                  </span>
                  ${EMAIL}
                </a>
                <a href="https://${WEBSITE}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#fff;font-weight:700;text-decoration:none;">
                  <span style="background:rgba(255,255,255,0.12);width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;">
                    ${GlobeIconNoMargin}
                  </span>
                  ${WEBSITE}
                </a>
              </div>
            </div>
          </div>
          ${printContent.querySelector(".print-body")?.innerHTML || ""}
          <div style="background:#0f172a;padding:22px 36px 18px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;margin-bottom:18px;">
              <div>
                <img src="${origin}${logoTextSrc}" alt="Diploma2Degree" style="height:22px;filter:brightness(0) invert(1);object-fit:contain;margin-bottom:8px;" />
                <div style="font-size:11px;color:#94a3b8;line-height:1.7;max-width:200px;">Maharashtra's #1 DSE Counselling Platform.<br/>Helping diploma students find their dream engineering college.</div>
              </div>
              <div>
                <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-bottom:9px;text-transform:uppercase;letter-spacing:0.6px;">Contact Us</div>
                ${contactHTML}
              </div>
              <div>
                <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-bottom:9px;text-transform:uppercase;letter-spacing:0.6px;">Follow & Join Us</div>
                ${socialHTML}
              </div>
              <div>
                <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-bottom:9px;text-transform:uppercase;letter-spacing:0.6px;">Download App</div>
                <a href="https://play.google.com/store/apps/details?id=com.d2d.diploma2degree&pcampaignid=web_share" target="_blank"
                   style="display:inline-flex;align-items:center;gap:8px;background:#1e293b;padding:6px 12px;border-radius:8px;color:#fff;text-decoration:none;font-size:11px;font-weight:700;border:1px solid #334155;margin-top:4px;">
                  <svg viewBox="0 0 365 365" style="width:14px;height:14px;" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.3 3.3c-.8.8-1.3 2-1.3 3.7v346c0 1.7.5 2.9 1.3 3.7l1.7 1.7L209 170.5v-3L20 1.6l-1.7 1.7z" fill="#ea4335" />
                    <path d="M272.5 234.3l-63.5-63.8v-3l63.5-63.8 1.7.9 75 42.6c21.4 12.2 21.4 32 0 44.2l-75 42.6-1.7.3z" fill="#fbbc05" />
                    <path d="M20.8 356.7l188.2-188.7 63.8 63.8-198.3 112.7c-7.1 4-13.1.8-13.7-7.8z" fill="#34a853" />
                    <path d="M20.8 8.3C21.4 1.3 27.4-3 34.5 1L232.8 114l-63.8 63.8L20.8 8.3z" fill="#4285f4" />
                  </svg>
                  <span>Get it on Google Play</span>
                </a>
              </div>
            </div>
            <div style="border-top:1px solid #1e293b;padding-top:12px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <div style="font-size:10px;color:#475569;">© ${new Date().getFullYear()} Diploma2Degree. All rights reserved.</div>
              <div style="font-size:10px;color:#475569;">Data sourced from DTE Maharashtra</div>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .responsive-margin {
            margin-left: 12px !important;
            margin-right: 12px !important;
          }
          .responsive-padding {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .responsive-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .responsive-contact {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>
      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-3 mb-5 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Download / Print PDF
        </button>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
            Close
          </button>
        )}
      </div>

      {/* ── Preview Wrapper ── */}
      <div ref={printRef} style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", width: "100%" }}>

        {/* ── HEADER (preview only — print version is in handlePrint) ── */}
        <div className="responsive-margin" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)", margin: "20px 36px 0", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
          <div style={{ height: "4px", background: "#f97316" }} />
          <div className="responsive-padding" style={{ padding: "20px 24px 16px" }}>
            {/* Brand Row */}
            <div className="responsive-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <img src={logoIconSrc} alt="D2D Logo" style={{ height: "48px", width: "48px", borderRadius: "14px", objectFit: "contain", background: "rgba(255,255,255,0.12)", padding: "4px", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                <div>
                  <h1 style={{ fontSize: "24px", fontWeight: 850, color: "#fff", margin: 0, lineHeight: 1.2, letterSpacing: "-0.5px" }}>Diploma2Degree</h1>
                  <span style={{ display: "inline-block", background: "#c6f6d5", color: "#1c643b", fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px", marginTop: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Maharashtra's #1 DSE Platform</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "9px", color: "#c7d2fe", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "2px" }}>Generated on</div>
                <div style={{ fontSize: "14px", color: "#fff", fontWeight: 800 }}>{today}</div>
              </div>
            </div>

            {/* Tagline */}
            <div className="responsive-padding" style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "12px", padding: "20px 24px", marginBottom: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: "-10px", top: "-10px", opacity: 0.07, color: "#fff", pointerEvents: "none" }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>

              <div className="responsive-header" style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
                <div style={{ background: "#f59e0b", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyItems: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(245,158,11,0.3)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>10,000+ Students Got Their Dream College!</div>
                  <div style={{ fontSize: "12px", color: "#c7d2fe", marginTop: "4px", lineHeight: "1.5" }}>Maharashtra's #1 DSE Counselling Platform — helping diploma students transition smoothly into degree engineering.</div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", color: "#fbbf24", fontWeight: 800, letterSpacing: "0.8px", marginBottom: "8px" }}>Our 100% Free Tools &amp; Features</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
                    {[
                      "College Predictor",
                      "Cutoff Rank Finder",
                      "Personalized Option Form",
                      "Counselling Alerts"
                    ].map((feature, idx) => (
                      <span key={idx} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", padding: "6px 14px", borderRadius: "9999px", fontSize: "11px", color: "#fff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ background: "#10b981", width: "14px", height: "14px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#fff", fontWeight: 800 }}>✔</span>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px" }}>
                  <div style={{ background: "#fff", padding: "10px 18px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "280px", flex: "1 1 200px" }}>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginBottom: "2px" }}>Want to generate your own report?</div>
                    <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Visit {WEBSITE} <span style={{ fontSize: "14px" }}>➔</span>
                    </a>
                  </div>
                  <div style={{ background: "#fff", padding: "10px 18px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: "280px", flex: "1 1 200px" }}>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginBottom: "2px" }}>Download our Android App</div>
                    <a href="https://play.google.com/store/apps/details?id=com.d2d.diploma2degree&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" style={{ fontSize: "13px", color: "#0d9488", fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      Get it on Google Play <span style={{ fontSize: "14px" }}>➔</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact strip */}
            <div className="responsive-contact" style={{ display: "flex", flexWrap: "wrap", gap: "14px 24px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { Icon: PhoneIcon, text: PHONE, href: `tel:${PHONE.replace(/\s+/g, "")}` },
                { Icon: MailIcon, text: EMAIL, href: `mailto:${EMAIL}` },
                { Icon: GlobeIcon, text: WEBSITE, href: `https://${WEBSITE}` }
              ].map(({ Icon, text, href }, i) => (
                <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
                  <span style={{ background: "rgba(255,255,255,0.12)", width: "26px", height: "26px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Icon />
                  </span>
                  {text}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY (shared between preview + print) ── */}
        <div className="print-body" style={{ background: "#fffefb", padding: "24px 0 10px" }}>
          {/* Student Info Bar */}
          <div className="responsive-margin responsive-padding" style={{ background: "#fbfbfb", border: "1px solid #eaeaea", borderRadius: "16px", padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 14px", margin: "0 36px 14px" }}>
            <span style={{ fontSize: "15px", fontWeight: 850, color: "#0f172a", marginRight: "6px" }}>College Recommendation Report</span>
            {scoreLabel && (
              <span style={{ background: "#0d9488", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "9999px" }}>
                Score/Rank: <span style={{ fontWeight: 800 }}>{scoreLabel}</span>
              </span>
            )}
            {branch && (
              <span style={{ background: "#6d28d9", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "9999px" }}>
                Branch: <span style={{ fontWeight: 800 }}>{branch}</span>
              </span>
            )}
            {city && (
              <span style={{ background: "#ea580c", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "9999px" }}>
                City: <span style={{ fontWeight: 800 }}>{city}</span>
              </span>
            )}
            {category && (
              <span style={{ background: "#2563eb", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "5px 12px", borderRadius: "9999px" }}>
                Category: <span style={{ fontWeight: 800 }}>{category}</span>
              </span>
            )}
          </div>

          {/* Total Matched Card */}
          <div className="responsive-margin" style={{ margin: "0 36px 16px" }}>
            <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "14px", padding: "10px 16px", display: "inline-flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
              <div style={{ background: "#fef3c7", color: "#d97706", width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyItems: "center", fontSize: "20px", fontWeight: 900 }}>
                {colleges.length}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, lineHeight: 1.2 }}>Total colleges</div>
                <div style={{ fontSize: "12px", color: "#0f172a", fontWeight: 800, lineHeight: 1.2 }}>matched for you</div>
              </div>
            </div>
          </div>

          {/* College Table */}
          <div className="responsive-padding" style={{ padding: "20px 36px" }}>
            <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#1e293b", color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, width: "32px" }}>#</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>College Name</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700 }}>Branch</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, width: "80px" }}>City</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, width: "80px" }}>Status</th>
                    {category && (
                      <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, width: "100px" }}>
                        Cutoff<br /><span style={{ fontWeight: 400, fontSize: "10px", color: "#94a3b8" }}>{category}</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college, index) => {
                    const cutoff = college.Cutoffs?.find((c: Cutoff) => c.Category === category)
                      || college.Cutoffs?.find((c: Cutoff) => c.Category === "GOPEN");
                    return (
                      <tr key={index} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "9px 12px", fontWeight: 700, color: "#64748b" }}>{index + 1}</td>
                        <td style={{ padding: "9px 12px", fontWeight: 700, color: "#0f172a", lineHeight: "1.4" }}>
                          {college["College Name"]}
                          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 400, marginTop: "1px" }}>Code: {college["College Code"]}</div>
                        </td>
                        <td style={{ padding: "9px 12px", color: "#334155", lineHeight: "1.4" }}>{college["Course Name"]}</td>
                        <td style={{ padding: "9px 12px", color: "#334155" }}>{college.City}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, background: "#f1f5f9", color: "#475569" }}>
                            {college.Status}
                          </span>
                        </td>
                        {category && (
                          <td style={{ padding: "9px 12px" }}>
                            {cutoff ? (
                              <div>
                                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>{cutoff.Score}</div>
                                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Rank: {cutoff.Rank}</div>
                              </div>
                            ) : (
                              <span style={{ color: "#cbd5e1", fontSize: "10px" }}>N/A</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {colleges.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>No colleges to display.</div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="responsive-margin" style={{ margin: "0 36px 20px", padding: "12px 16px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "#713f12", lineHeight: "1.6" }}>
              <strong>Disclaimer:</strong> This report is generated based on previous year's cutoff data from DTE Maharashtra. Actual cutoffs may vary. Please verify with official DTE Maharashtra sources before making any admission decisions. Diploma2Degree is a guidance platform and does not guarantee admission.
            </p>
          </div>
        </div>

        {/* ── FOOTER (preview) ── */}
        <div className="responsive-padding" style={{ background: "#0f172a", padding: "22px 36px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "18px" }}>
            {/* Brand */}
            <div>
              <img src={logoTextSrc} alt="Diploma2Degree" style={{ height: "22px", filter: "brightness(0) invert(1)", objectFit: "contain", marginBottom: "8px" }} />
              <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.7", maxWidth: "200px" }}>
                Maharashtra's #1 DSE Counselling Platform.<br />Helping diploma students find their dream engineering college.
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0", marginBottom: "9px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Contact Us</div>
              {[
                { Icon: PhoneIcon, text: PHONE, href: `tel:${PHONE}` },
                { Icon: MailIcon, text: EMAIL, href: `mailto:${EMAIL}` },
                { Icon: GlobeIcon, text: WEBSITE, href: `https://${WEBSITE}` }
              ].map(({ Icon, text, href }, i) => (
                <a key={i} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#94a3b8", marginBottom: "5px", textDecoration: "none" }}>
                  <Icon />{text}
                </a>
              ))}
            </div>

            {/* Social */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0", marginBottom: "9px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Follow &amp; Join Us</div>
              {[
                { Icon: WhatsAppIcon, label: "WhatsApp Group", url: "https://chat.whatsapp.com/LTcuLVPipunFPjodf2ifkl", color: "#25D366" },
                { Icon: InstagramIcon, label: "Instagram", url: "https://www.instagram.com/diploma_2_degree", color: "#E1306C" },
                { Icon: FacebookIcon, label: "Facebook", url: "https://www.facebook.com/share/163fQuaUqb/", color: "#1877F2" },
                { Icon: LinkedInIcon, label: "LinkedIn", url: "https://www.linkedin.com/company/diploma2degree", color: "#0A66C2" },
              ].map(({ Icon, label, url, color }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", fontSize: "12px", color, fontWeight: 600, marginBottom: "6px", textDecoration: "none" }}>
                  <Icon />{label}
                </a>
              ))}
            </div>

            {/* Download App */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0", marginBottom: "9px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Download App</div>
              <a href="https://play.google.com/store/apps/details?id=com.d2d.diploma2degree&pcampaignid=web_share" target="_blank" rel="noopener noreferrer"
                 style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1e293b", padding: "6px 12px", borderRadius: "8px", color: "#fff", textDecoration: "none", fontSize: "11px", fontWeight: 700, border: "1px solid #334155", marginTop: "4px" }}>
                <svg viewBox="0 0 365 365" style={{ width: "14px", height: "14px" }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.3 3.3c-.8.8-1.3 2-1.3 3.7v346c0 1.7.5 2.9 1.3 3.7l1.7 1.7L209 170.5v-3L20 1.6l-1.7 1.7z" fill="#ea4335" />
                  <path d="M272.5 234.3l-63.5-63.8v-3l63.5-63.8 1.7.9 75 42.6c21.4 12.2 21.4 32 0 44.2l-75 42.6-1.7.3z" fill="#fbbc05" />
                  <path d="M20.8 356.7l188.2-188.7 63.8 63.8-198.3 112.7c-7.1 4-13.1.8-13.7-7.8z" fill="#34a853" />
                  <path d="M20.8 8.3C21.4 1.3 27.4-3 34.5 1L232.8 114l-63.8 63.8L20.8 8.3z" fill="#4285f4" />
                </svg>
                <span>Get it on Google Play</span>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: "12px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "10px", color: "#475569" }}>© {new Date().getFullYear()} Diploma2Degree. All rights reserved.</div>
            <div style={{ fontSize: "10px", color: "#475569" }}>Data sourced from DTE Maharashtra • Report generated {today}</div>
          </div>
        </div>

      </div>
    </>
  );
}
