import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);

// Resend free tier sends from onboarding@resend.dev
const FROM_EMAIL = 'Innovators Fund <onboarding@resend.dev>';

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
              <p style="font-size: 13px; color: #71717a; margin-bottom: 12px;">Admins (Snehansh &amp; Prattay) can review and approve in the Innovators Fund dashboard.</p>
            </div>
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.toEmails,
      subject: `[Innovators Fund] New Request: ${formattedAmount} by ${params.requesterName}`,
      html,
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error sending Resend email:', error?.message || error);
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
          .footer { background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; }
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
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.toEmails,
      subject: `[Innovators Fund] Request ${params.status.toUpperCase()}: ${formattedAmount} for ${params.requesterName}`,
      html,
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error sending Resend audit status email:', error?.message || error);
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
          .footer { background: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #a1a1aa; }
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
          </div>
          <div class="footer">
            Innovators Fund Management System &bull; Audited &amp; Tracked Automatically
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.toEmails,
      subject: `[Innovators Fund] +${formattedDeposit} Deposited by ${params.adminName}`,
      html,
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error sending Resend deposit email:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}