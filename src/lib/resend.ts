import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

// Base URL for links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://innovators.eu.cc';

// Senders
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Innovators Fund <notifications@innovators.eu.cc>';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `Innovators Fund <${SMTP_USER}>`;

// Reusable Gmail Transporter when SMTP credentials are present
const smtpTransporter = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

/**
 * Universal email dispatcher:
 * Uses Gmail SMTP first (guaranteed 100% inbox delivery without domain reputation blocks)
 * Falls back to Resend API if SMTP is not configured or encounters an issue.
 */
async function dispatchEmail(options: {
  toEmails: string[];
  subject: string;
  html: string;
  text?: string;
}) {
  if (smtpTransporter && SMTP_USER) {
    try {
      const info = await smtpTransporter.sendMail({
        from: SMTP_FROM,
        to: options.toEmails,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });
      return { success: true, via: 'smtp', messageId: info.messageId };
    } catch (smtpError: any) {
      console.warn('Gmail SMTP send failed, falling back to Resend:', smtpError?.message || smtpError);
    }
  }

  // Fallback to Resend API
  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: options.toEmails,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return { success: true, via: 'resend', data: result };
  } catch (resendError: any) {
    console.error('Resend email dispatch error:', resendError?.message || resendError);
    return { success: false, error: resendError?.message || resendError };
  }
}

export interface SendRequestEmailParams {
  toEmails: string[];
  requesterName: string;
  amount: number;
  reason: string;
  category: string;
  currentBalance: number;
  remainingAfter: number;
  requestId: string;
}

export async function sendNewRequestEmail(params: SendRequestEmailParams) {
  if (!params.toEmails || params.toEmails.length === 0) {
    return { success: false, reason: 'No recipient emails configured' };
  }

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.amount);

  const formattedCurrentBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.currentBalance);

  const formattedRemaining = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.remainingAfter);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #09090b; color: #ffffff; padding: 24px; text-align: center; }
          .badge { display: inline-block; background: #fef08a; color: #854d0e; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
          .content { padding: 24px; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
          .amount { font-size: 32px; font-weight: 700; color: #0284c7; }
          .balance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
          .balance-card { background: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 12px; text-align: center; }
          .balance-val { font-size: 18px; font-weight: 600; color: #10b981; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 8px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
          .info-table td.label { color: #71717a; width: 35%; font-weight: 500; }
          .info-table td.val { color: #09090b; font-weight: 600; }
          .btn-container { text-align: center; margin-top: 24px; }
          .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">Pending Approval</div>
            <h1 style="margin: 0; font-size: 22px;">Innovators Fund Request</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #a1a1aa;">A new fund request has been submitted for review</p>
          </div>
          <div class="content">
            <div class="amount-box">
              <div style="font-size: 13px; color: #64748b; font-weight: 500;">REQUESTED AMOUNT</div>
              <div class="amount">${formattedAmount}</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="label">Requested By</td>
                <td class="val">${params.requesterName}</td>
              </tr>
              <tr>
                <td class="label">Category</td>
                <td class="val">${params.category}</td>
              </tr>
              <tr>
                <td class="label">Reason / Purpose</td>
                <td class="val">${params.reason}</td>
              </tr>
            </table>

            <div class="balance-grid">
              <div class="balance-card">
                <div style="font-size: 11px; color: #71717a;">CURRENT POOL</div>
                <div class="balance-val">${formattedCurrentBalance}</div>
              </div>
              <div class="balance-card">
                <div style="font-size: 11px; color: #71717a;">IF APPROVED</div>
                <div class="balance-val" style="color: #0284c7;">${formattedRemaining}</div>
              </div>
            </div>

            <div class="btn-container">
              <a href="${BASE_URL}/?tab=requests&request=${params.requestId}" class="btn">
                Review &amp; Manage Request &rarr;
              </a>
              <p style="font-size: 12px; color: #71717a; margin-top: 14px; margin-bottom: 0;">
                Admins (Snehansh &amp; Prattay) can approve or reject directly from the dashboard.
              </p>
            </div>
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Innovators Fund Request\n\nA new fund request has been submitted for review:\nRequested Amount: ${formattedAmount}\nRequested By: ${params.requesterName}\nCategory: ${params.category}\nReason: ${params.reason}\n\nReview & Manage Request: ${BASE_URL}/?tab=requests&request=${params.requestId}`;

  try {
    return await dispatchEmail({
      toEmails: params.toEmails,
      subject: `[Innovators Fund] New Request: ${formattedAmount} by ${params.requesterName}`,
      html,
      text,
    });
  } catch (error: any) {
    console.error('Error sending request email:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}

export interface SendAuditStatusEmailParams {
  toEmails: string[];
  requesterName: string;
  reviewerName: string;
  amount: number;
  status: 'approved' | 'rejected';
  adminNotes?: string | null;
  newBalance: number;
  requestId?: string;
}

export async function sendAuditStatusEmail(params: SendAuditStatusEmailParams) {
  if (!params.toEmails || params.toEmails.length === 0) {
    return { success: false, reason: 'No recipient emails configured' };
  }

  const isApproved = params.status === 'approved';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.amount);

  const formattedNewBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.newBalance);

  const requestUrl = params.requestId
    ? `${BASE_URL}/?tab=requests&request=${params.requestId}`
    : `${BASE_URL}/?tab=requests`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
          .header { background: ${isApproved ? '#065f46' : '#991b1b'}; color: #ffffff; padding: 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
          .content { padding: 24px; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
          .amount { font-size: 30px; font-weight: 700; color: ${isApproved ? '#10b981' : '#ef4444'}; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 8px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
          .info-table td.label { color: #71717a; width: 35%; font-weight: 500; }
          .info-table td.val { color: #09090b; font-weight: 600; }
          .btn-container { text-align: center; margin-top: 24px; }
          .btn { display: inline-block; background: ${isApproved ? '#059669' : '#dc2626'}; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">${params.status.toUpperCase()}</div>
            <h1 style="margin: 0; font-size: 22px;">Fund Request ${isApproved ? 'Approved' : 'Rejected'}</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Reviewed by ${params.reviewerName}</p>
          </div>
          <div class="content">
            <div class="amount-box">
              <div style="font-size: 13px; color: #64748b; font-weight: 500;">AMOUNT</div>
              <div class="amount">${formattedAmount}</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="label">Requester</td>
                <td class="val">${params.requesterName}</td>
              </tr>
              <tr>
                <td class="label">Reviewed By</td>
                <td class="val">${params.reviewerName} (Admin)</td>
              </tr>
              ${params.adminNotes ? `<tr><td class="label">Admin Remarks</td><td class="val">${params.adminNotes}</td></tr>` : ''}
              <tr>
                <td class="label">Updated Pool Balance</td>
                <td class="val" style="color: #10b981;">${formattedNewBalance}</td>
              </tr>
            </table>

            <div class="btn-container">
              <a href="${requestUrl}" class="btn">
                View Request in Ledger &rarr;
              </a>
            </div>
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Innovators Fund Request ${params.status.toUpperCase()}\n\nAmount: ${formattedAmount}\nRequester: ${params.requesterName}\nReviewed By: ${params.reviewerName}\nUpdated Pool Balance: ${formattedNewBalance}${params.adminNotes ? `\nRemarks: ${params.adminNotes}` : ''}\n\nView details: ${requestUrl}`;

  try {
    return await dispatchEmail({
      toEmails: params.toEmails,
      subject: `[Innovators Fund] Request ${params.status.toUpperCase()}: ${formattedAmount} for ${params.requesterName}`,
      html,
      text,
    });
  } catch (error: any) {
    console.error('Error sending audit status email:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}

export interface SendPoolDepositEmailParams {
  toEmails: string[];
  adminName: string;
  depositAmount: number;
  newTotalInitial: number;
  newAvailableBalance: number;
  notes?: string;
}

export async function sendPoolDepositEmail(params: SendPoolDepositEmailParams) {
  if (!params.toEmails || params.toEmails.length === 0) {
    return { success: false, reason: 'No recipient emails configured' };
  }

  const formattedDeposit = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.depositAmount);

  const formattedTotalInitial = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.newTotalInitial);

  const formattedAvailable = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(params.newAvailableBalance);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: #09090b; color: #ffffff; padding: 24px; text-align: center; }
          .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
          .content { padding: 24px; }
          .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
          .amount { font-size: 32px; font-weight: 700; color: #16a34a; }
          .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .info-table td { padding: 8px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
          .info-table td.label { color: #71717a; width: 40%; font-weight: 500; }
          .info-table td.val { color: #09090b; font-weight: 600; }
          .btn-container { text-align: center; margin-top: 24px; }
          .btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">CAPITAL DEPOSITED</div>
            <h1 style="margin: 0; font-size: 22px;">Funds Added to Pool</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Deposited by Admin ${params.adminName}</p>
          </div>
          <div class="content">
            <div class="amount-box">
              <div style="font-size: 13px; color: #15803d; font-weight: 500;">AMOUNT ADDED</div>
              <div class="amount">+${formattedDeposit}</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="label">Deposited By</td>
                <td class="val">${params.adminName} (Administrator)</td>
              </tr>
              ${params.notes ? `<tr><td class="label">Deposit Remarks</td><td class="val">${params.notes}</td></tr>` : ''}
              <tr>
                <td class="label">New Available Balance</td>
                <td class="val" style="color: #16a34a; font-size: 16px;">${formattedAvailable}</td>
              </tr>
              <tr>
                <td class="label">Cumulative Capital Pool</td>
                <td class="val">${formattedTotalInitial}</td>
              </tr>
            </table>

            <div class="btn-container">
              <a href="${BASE_URL}/?tab=dashboard" class="btn">
                View Pool Ledger &rarr;
              </a>
            </div>
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `Innovators Fund Deposit\n\n+${formattedDeposit} has been deposited to the pool by Admin ${params.adminName}.\nNew Available Balance: ${formattedAvailable}\nCumulative Capital Pool: ${formattedTotalInitial}\n\nView details: ${BASE_URL}/?tab=dashboard`;

  try {
    return await dispatchEmail({
      toEmails: params.toEmails,
      subject: `[Innovators Fund] +${formattedDeposit} Deposited by ${params.adminName}`,
      html,
      text,
    });
  } catch (error: any) {
    console.error('Error sending deposit email:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}