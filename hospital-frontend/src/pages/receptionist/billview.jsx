import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "../../css/receptionist/billing.css";

export default function BillView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  if (!state) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="error-title">Invoice Not Found</h2>
          <p className="error-text">The requested invoice could not be located. Please verify the information or contact support.</p>
          <button onClick={() => navigate(-1)} className="error-button">
            Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  const downloadBill = () => {
    const element = reportRef.current;
    const opt = {
      margin: [0.75, 0.75, 0.75, 0.75],
      filename: `INVOICE_${state.billId}_${state.patientName.replace(/\s/g, "_")}_${state.date.replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 3, 
        letterRendering: true, 
        useCORS: true, 
        logging: false,
        backgroundColor: "#ffffff"
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate totals
  const subtotal = parseFloat(state.consultationFee) + parseFloat(state.serviceCharges) + parseFloat(state.medicineCharges);
  const discountAmount = parseFloat(state.discount);
  const afterDiscount = subtotal - discountAmount;
  const gstRate = 0.05; // 5% GST
  const gstAmount = afterDiscount * gstRate;
  const grandTotal = afterDiscount + gstAmount;

  // Function to convert number to words in English
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertToWords = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertToWords(n % 100) : '');
      if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
      if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
      return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let rupeesInWords = convertToWords(rupees);
    let result = rupeesInWords + ' Rupees';
    
    if (paise > 0) {
      result += ' And ' + convertToWords(paise) + ' Paise';
    }
    
    return result;
  };

  return (
    <div className="bill-view-container">
      <div ref={reportRef} className="bill-invoice">
        {/* Watermark */}
        <div className="watermark">HealthAxis</div>
        
        {/* Top Border Strip */}
        <div className="top-border-strip"></div>
        
        {/* Header Section */}
        <div className="invoice-header">
          <div className="company-info">
            <div className="company-logo">
              <div className="logo-mark">
                <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="company-name">HealthAxis</h1>
                <p className="company-tagline">Multi-Specialty Hospital</p>
              </div>
            </div>
            <div className="company-address">
              <p>123 Healthcare Avenue, Medical District</p>
              <p>Mumbai - 400001, Maharashtra, India</p>
              <p>Tel: +91 22 1234 5678 | Email: accounts@healthaxis.com</p>
              <p>GSTIN: 27AAACM1234E1ZR | CIN: U85100MH2020PTC123456</p>
            </div>
          </div>
          <div className="invoice-title-section">
            <div className="invoice-type">
              <span className="invoice-badge">TAX INVOICE</span>
            </div>
            <div className="invoice-meta">
              <div className="meta-item">
                <span className="meta-label">Invoice No:</span>
                <span className="meta-value">INV-{String(state.billId).padStart(6, '0')}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Invoice Date:</span>
                <span className="meta-value">{formatDate(state.date)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Payment Terms:</span>
                <span className="meta-value">Due on Receipt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="bill-to-section">
          <div className="section-title">
            <span className="title-indicator"></span>
            <h3>Bill To</h3>
          </div>
          <div className="bill-to-content">
            <div className="customer-info">
              <p className="customer-name">{state.patientName}</p>
              <p className="customer-detail">Patient ID: {state.patientId}</p>
              <p className="customer-detail">Mobile: +91 XXXXXXXXXX</p>
            </div>
            <div className="reference-info">
              <div className="ref-row">
                <span className="ref-label">Doctor Referred By:</span>
                <span className="ref-value">Dr. {state.doctorName}</span>
              </div>
              <div className="ref-row">
                <span className="ref-label">Department:</span>
                <span className="ref-value">General Medicine</span>
              </div>
              <div className="ref-row">
                <span className="ref-label">Payment Mode:</span>
                <span className="ref-value payment-mode">{state.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th className="col-sno">#</th>
                <th className="col-description">Particulars / Description</th>
                <th className="col-hsn">HSN/SAC</th>
                <th className="col-amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-sno">1</td>
                <td className="col-description">
                  <span className="item-title">Consultation Fee</span>
                  <span className="item-subtitle">Specialist Doctor Consultation</span>
                </td>
                <td className="col-hsn">998301</td>
                <td className="col-amount">{formatCurrency(state.consultationFee)}</td>
              </tr>
              <tr>
                <td className="col-sno">2</td>
                <td className="col-description">
                  <span className="item-title">Service Charges</span>
                  <span className="item-subtitle">Medical Facility & Nursing Care</span>
                </td>
                <td className="col-hsn">998319</td>
                <td className="col-amount">{formatCurrency(state.serviceCharges)}</td>
              </tr>
              <tr>
                <td className="col-sno">3</td>
                <td className="col-description">
                  <span className="item-title">Medicine Charges</span>
                  <span className="item-subtitle">Pharmacy & Dispensing Services</span>
                </td>
                <td className="col-hsn">998318</td>
                <td className="col-amount">{formatCurrency(state.medicineCharges)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-left">
              <div className="bank-details">
                <h4>Bank Account Details</h4>
                <div className="bank-row">
                  <span>Bank Name:</span>
                  <strong>HDFC Bank Ltd.</strong>
                </div>
                <div className="bank-row">
                  <span>Account Name:</span>
                  <strong>HealthAxis Hospital</strong>
                </div>
                <div className="bank-row">
                  <span>Account No.:</span>
                  <strong>50200012345678</strong>
                </div>
                <div className="bank-row">
                  <span>IFSC Code:</span>
                  <strong>HDFC0001234</strong>
                </div>
                <div className="bank-row">
                  <span>UPI ID:</span>
                  <strong>healthaxis@hdfcbank</strong>
                </div>
              </div>
            </div>
            <div className="summary-right">
              <div className="amount-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
                <div className="summary-row">
                  <span>Net Amount:</span>
                  <span>{formatCurrency(afterDiscount)}</span>
                </div>
                <div className="summary-row tax">
                  <span>GST (5%):</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="amount-in-words">
                  <span>Amount in Words:</span>
                  <strong>{numberToWords(grandTotal)} Only</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="terms-section">
          <div className="terms-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <h4>Terms & Conditions</h4>
          </div>
          <div className="terms-content">
            <ul>
              <li>This invoice is computer generated and requires no signature.</li>
              <li>Payment is due immediately upon receipt of this invoice.</li>
              <li>For any discrepancies, please contact the billing department within 7 days.</li>
              <li>This is a legally valid document for tax purposes.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-signature">
            <div className="signature-line"></div>
            <p>Authorized Signatory</p>
            <p className="signature-note">(For HealthAxis Hospital)</p>
          </div>
          <div className="footer-note">
            <p>Thank you for choosing HealthAxis. We wish you a speedy recovery!</p>
            <p className="footer-small">* This is a system generated invoice, valid without signature *</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <button onClick={downloadBill} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Invoice (PDF)
        </button>
      </div>
    </div>
  );
}