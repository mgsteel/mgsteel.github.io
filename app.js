'use strict';

// ── Constants ────────────────────────────────────────────────
const COMPANY = {
  name:    'M&G Steel Projects',
  tagline: 'Structural Steel Fabrication | Miscellaneous Steel\nStairs | Railings | Canopies | Custom Projects',
  address: '227 E. 9th Ave.\nEscondido, CA 92025',
  phone:   '619-402-2918',
  email:   'alanmgsteel@gmail.com',
  license: '26522893',
};

// Carta a 96 dpi: 8.5" × 11"
const PAGE_W_PX = 816;
const PAGE_H_PX = 1056;
// Items que caben cómodamente en la primera página vs páginas de continuación
const ITEMS_FIRST_PAGE  = 8;
const ITEMS_CONT_PAGE   = 18;

// ── DOM refs ─────────────────────────────────────────────────
const lineItemsBody       = document.getElementById('lineItemsBody');
const addRowBtn           = document.getElementById('addRowBtn');
const subtotalEl          = document.getElementById('subtotalDisplay');
const taxRateEl           = document.getElementById('taxRate');
const taxEl               = document.getElementById('taxDisplay');
const totalEl             = document.getElementById('totalDisplay');
const balanceEl           = document.getElementById('balanceDisplay');
const previewBtn          = document.getElementById('previewBtn');
const downloadBtn         = document.getElementById('downloadBtn');
const previewModal        = document.getElementById('previewModal');
const modalBackdrop       = document.getElementById('modalBackdrop');
const modalClose          = document.getElementById('modalClose');
const invoicePreview      = document.getElementById('invoicePreview');
const invoicePreviewClone = document.getElementById('invoicePreviewClone');
const modalDownload       = document.getElementById('modalDownloadBtn');

// ── Line item management ──────────────────────────────────────
function createRow() {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text"   class="li-desc"  placeholder="Description" /></td>
    <td><input type="number" class="li-qty"   placeholder="0" min="0" step="any" /></td>
    <td><input type="text"   class="li-unit"  placeholder="ea" /></td>
    <td><input type="number" class="li-price" placeholder="0.00" min="0" step="0.01" /></td>
    <td class="amount-cell li-amount">$0.00</td>
    <td><button type="button" class="btn-remove" title="Remove row">✕</button></td>
  `;
  tr.querySelector('.btn-remove').addEventListener('click', () => { tr.remove(); recalc(); });
  ['li-qty', 'li-price'].forEach(cls => {
    tr.querySelector(`.${cls}`).addEventListener('input', () => { updateRowAmount(tr); recalc(); });
  });
  lineItemsBody.appendChild(tr);
  return tr;
}

function updateRowAmount(tr) {
  const qty   = parseFloat(tr.querySelector('.li-qty').value)   || 0;
  const price = parseFloat(tr.querySelector('.li-price').value) || 0;
  tr.querySelector('.li-amount').textContent = fmt(qty * price);
}

function getLineItems() {
  return Array.from(lineItemsBody.querySelectorAll('tr')).map(tr => ({
    desc:   tr.querySelector('.li-desc').value.trim(),
    qty:    tr.querySelector('.li-qty').value,
    unit:   tr.querySelector('.li-unit').value.trim(),
    price:  parseFloat(tr.querySelector('.li-price').value) || 0,
    amount: (parseFloat(tr.querySelector('.li-qty').value) || 0)
          * (parseFloat(tr.querySelector('.li-price').value) || 0),
  }));
}

// ── Totals ────────────────────────────────────────────────────
function recalc() {
  const items    = getLineItems();
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxRate  = parseFloat(taxRateEl.value) || 0;
  const tax      = subtotal * taxRate / 100;
  const total    = subtotal + tax;
  subtotalEl.textContent = fmt(subtotal);
  taxEl.textContent      = fmt(tax);
  totalEl.textContent    = fmt(total);
  balanceEl.textContent  = fmt(total);
}

function fmt(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ── Read form values ──────────────────────────────────────────
function getFormData() {
  const v = id => document.getElementById(id)?.value.trim() ?? '';
  const items    = getLineItems();
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxRate  = parseFloat(taxRateEl.value) || 0;
  const tax      = subtotal * taxRate / 100;
  const total    = subtotal + tax;
  return {
    invoiceNo:  v('invoiceNo'),
    date:       v('invoiceDate'),
    dueDate:    v('dueDate'),
    poNumber:   v('poNumber'),
    bill: {
      company: v('billCompany'),
      contact: v('billContact'),
      address: v('billAddress'),
      phone:   v('billPhone'),
      email:   v('billEmail'),
    },
    project: {
      name:        v('projectName'),
      location:    v('projectLocation'),
      description: v('projectDescription'),
    },
    items,
    notes:        v('notes'),
    paymentTerms: v('paymentTerms'),
    taxRate,
    subtotal,
    tax,
    total,
  };
}

// ── HTML builders ─────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// SVG icons embedded inline for html2canvas compatibility
const SVG_BUILDING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56" width="38" height="44" fill="none">
  <rect x="6" y="8" width="36" height="44" rx="1" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
  <rect x="6" y="8" width="36" height="10" fill="rgba(255,255,255,0.2)"/>
  <rect x="12" y="22" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="22" y="22" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="32" y="22" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="12" y="32" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="22" y="32" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="32" y="32" width="6" height="6" fill="rgba(255,255,255,0.5)"/>
  <rect x="19" y="42" width="10" height="10" fill="rgba(255,255,255,0.6)"/>
</svg>`;

const SVG_IBEAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="38" height="38" fill="none">
  <rect x="4"  y="4"  width="40" height="7" rx="1" fill="rgba(255,255,255,0.75)"/>
  <rect x="4"  y="37" width="40" height="7" rx="1" fill="rgba(255,255,255,0.75)"/>
  <rect x="20" y="11" width="8"  height="26"       fill="rgba(255,255,255,0.75)"/>
</svg>`;

const SVG_CLIPBOARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a2744" stroke-width="2" stroke-linecap="round">
  <rect x="8" y="2" width="8" height="3" rx="1"/>
  <path d="M5 3h2v2H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1h-2V3h2a3 3 0 013 3v14a3 3 0 01-3 3H5a3 3 0 01-3-3V6a3 3 0 013-3z"/>
  <line x1="8" y1="11" x2="16" y2="11"/>
  <line x1="8" y1="15" x2="13" y2="15"/>
</svg>`;

const SVG_DOLLAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
  <circle cx="12" cy="12" r="11" fill="#c0392b"/>
  <text x="12" y="17" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff" font-family="Arial">$</text>
</svg>`;

// Diagonal accent SVG (between logo and meta table, matching template)
const SVG_DIAGONAL = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="160" viewBox="0 0 28 160">
  <line x1="22" y1="10" x2="6"  y2="150" stroke="#c0392b" stroke-width="3"/>
  <line x1="14" y1="10" x2="0"  y2="140" stroke="#d0d4db" stroke-width="1.5"/>
</svg>`;

function itemRowsHTML(items) {
  return items.map((item, i) => `
    <tr style="background:${i % 2 === 1 ? '#f4f6f9' : '#fff'};">
      <td style="padding:7px 10px;border-right:1px solid #e0e4ea;">${esc(item.desc)}</td>
      <td style="padding:7px 6px;text-align:center;border-right:1px solid #e0e4ea;">${esc(item.qty)}</td>
      <td style="padding:7px 6px;text-align:center;border-right:1px solid #e0e4ea;">${esc(item.unit)}</td>
      <td style="padding:7px 8px;text-align:right;border-right:1px solid #e0e4ea;">${fmt(item.price)}</td>
      <td style="padding:7px 10px;text-align:right;">${fmt(item.amount)}</td>
    </tr>`).join('');
}

function emptyRowsHTML(count) {
  return Array.from({length: count}, (_, i) => `
    <tr style="background:${i % 2 === 1 ? '#f4f6f9' : '#fff'};">
      <td style="padding:7px 10px;border-right:1px solid #e0e4ea;">&nbsp;</td>
      <td style="border-right:1px solid #e0e4ea;"></td>
      <td style="border-right:1px solid #e0e4ea;"></td>
      <td style="border-right:1px solid #e0e4ea;"></td>
      <td></td>
    </tr>`).join('');
}

// ── Page builders ─────────────────────────────────────────────
const P = `style="width:${PAGE_W_PX}px;min-height:${PAGE_H_PX}px;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#111;display:flex;flex-direction:column;box-sizing:border-box;"`;

function buildFirstPage(data, itemsSlice) {
  const padCount = Math.max(0, ITEMS_FIRST_PAGE - itemsSlice.length);
  return `
  <div class="inv-page" ${P}>

    <!-- ── HEADER ──────────────────────────────── -->
    <div style="display:flex;align-items:flex-start;padding:22px 28px 0 28px;min-height:195px;">

      <!-- Logo + tagline -->
      <div style="display:flex;flex-direction:column;width:280px;flex-shrink:0;">
        <img src="logo.jpeg" alt="M&G Steel Projects" style="width:220px;height:auto;" />
        <div style="font-size:7.5px;color:#555;margin-top:8px;line-height:1.7;letter-spacing:.02em;">
          ${esc(COMPANY.tagline).replace(/\n/g,'<br/>')}
        </div>
      </div>

      <!-- Diagonal accent -->
      <div style="flex-shrink:0;align-self:stretch;display:flex;align-items:center;padding:0 6px;">
        ${SVG_DIAGONAL}
      </div>

      <!-- INVOICE title + meta table -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:flex-end;">
        <div style="font-size:52px;font-weight:900;color:#1a2744;letter-spacing:.06em;line-height:1;text-transform:uppercase;margin-bottom:4px;">INVOICE</div>
        <div style="height:4px;background:#c0392b;width:100%;margin-bottom:10px;"></div>
        <!-- Meta rows -->
        <table style="border-collapse:collapse;width:100%;max-width:360px;">
          ${metaRow('&#128203;', 'INVOICE NO.', esc(data.invoiceNo))}
          ${metaRow('&#128197;', 'DATE',        formatDate(data.date))}
          ${metaRow('&#128336;', 'DUE DATE',    formatDate(data.dueDate))}
          ${metaRow('&#128193;', 'PO NUMBER',   esc(data.poNumber))}
        </table>
      </div>
    </div>

    <!-- ── SECTION DIVIDER ──────────────────────── -->
    <div style="height:3px;background:#c0392b;margin:10px 0 0 0;"></div>

    <!-- ── BILL TO + PROJECT INFO ───────────────── -->
    <div style="display:flex;gap:8px;margin:10px 28px;">

      <!-- Bill To -->
      <div style="flex:1;border:1px solid #ddd;overflow:hidden;">
        <!-- Header row -->
        <div style="background:#1a2744;color:#fff;display:flex;align-items:center;position:relative;height:32px;">
          <div style="width:10px;background:#1a2744;height:100%;"></div>
          <div style="font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;flex:1;padding-left:8px;">BILL TO</div>
          <!-- Red corner accent tab -->
          <div style="width:0;height:0;border-top:32px solid #c0392b;border-left:18px solid transparent;position:absolute;right:0;top:0;"></div>
        </div>
        <!-- Body: icon sidebar + fields -->
        <div style="display:flex;">
          <!-- Navy icon sidebar -->
          <div style="width:62px;background:#1a2744;display:flex;align-items:center;justify-content:center;flex-shrink:0;min-height:110px;">
            ${SVG_BUILDING}
          </div>
          <!-- Fields -->
          <div style="flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:7px;">
            ${billField('COMPANY NAME', data.bill.company)}
            ${billField('CONTACT NAME', data.bill.contact)}
            ${billField('ADDRESS',      data.bill.address)}
            ${billField('PHONE',        data.bill.phone)}
            ${billField('EMAIL',        data.bill.email)}
          </div>
        </div>
      </div>

      <!-- Project Information -->
      <div style="flex:1;border:1px solid #ddd;overflow:hidden;">
        <!-- Header row -->
        <div style="background:#c0392b;color:#fff;display:flex;align-items:center;position:relative;height:32px;">
          <div style="width:10px;background:#c0392b;height:100%;"></div>
          <div style="font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;flex:1;padding-left:8px;">PROJECT INFORMATION</div>
          <!-- Gray corner accent tab -->
          <div style="width:0;height:0;border-top:32px solid #8a9ab0;border-left:18px solid transparent;position:absolute;right:0;top:0;"></div>
        </div>
        <!-- Body: icon sidebar + fields -->
        <div style="display:flex;">
          <!-- Red icon sidebar -->
          <div style="width:62px;background:#c0392b;display:flex;align-items:center;justify-content:center;flex-shrink:0;min-height:90px;">
            ${SVG_IBEAM}
          </div>
          <!-- Fields -->
          <div style="flex:1;padding:10px 12px;display:flex;flex-direction:column;gap:7px;">
            ${billField('PROJECT NAME',        data.project.name)}
            ${billField('PROJECT LOCATION',    data.project.location)}
            ${billField('DESCRIPTION OF WORK', data.project.description)}
          </div>
        </div>
      </div>
    </div>

    <!-- ── LINE ITEMS ────────────────────────────── -->
    <div style="margin:6px 28px;flex:1;">
      ${itemsTableHTML(itemsSlice, padCount)}
    </div>

    ${bottomSectionHTML(data)}
    ${footerHTML()}
  </div>`;
}

function buildContinuationPage(data, itemsSlice, pageNum, totalPages) {
  const padCount = Math.max(0, ITEMS_CONT_PAGE - itemsSlice.length);
  return `
  <div class="inv-page" ${P}>
    <!-- Mini-header -->
    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 28px 10px;">
      <img src="logo.jpeg" alt="M&G Steel Projects" style="height:44px;width:auto;" />
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:900;color:#1a2744;text-transform:uppercase;letter-spacing:.06em;">INVOICE</div>
        <div style="font-size:8.5px;color:#666;margin-top:2px;">No. ${esc(data.invoiceNo)} &nbsp;·&nbsp; Page ${pageNum} of ${totalPages}</div>
      </div>
    </div>
    <div style="height:3px;background:#c0392b;margin:0;"></div>
    <div style="margin:8px 28px;flex:1;">
      ${itemsTableHTML(itemsSlice, padCount)}
    </div>
    ${bottomSectionHTML(data)}
    ${footerHTML()}
  </div>`;
}

// ── Shared HTML fragments ────────────────────────────────────

function metaRow(icon, label, value) {
  return `
    <tr>
      <td style="background:#1a2744;color:#fff;padding:7px 10px;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;border:1px solid #2d3d5c;border-right:none;">
        <span style="margin-right:5px;">${icon}</span>${label}
      </td>
      <td style="padding:7px 12px;font-size:9.5px;border:1px solid #ddd;border-left:2px solid #c0392b;min-width:160px;color:#222;">${value}</td>
    </tr>`;
}

function billField(label, value) {
  return `
    <div style="font-size:9px;">
      <span style="font-weight:700;color:#333;text-transform:uppercase;letter-spacing:.04em;">${label}:</span>
      <span style="display:inline-block;min-width:120px;border-bottom:1px solid #bbb;padding-bottom:1px;padding-left:4px;color:#444;">${esc(value || '')}</span>
    </div>`;
}

function itemsTableHTML(items, padCount) {
  const totalRows = items.length + padCount;
  // offset for alternating rows in continuation: start even
  return `
    <table style="width:100%;border-collapse:collapse;font-size:9.5px;">
      <thead>
        <tr style="background:#1a2744;color:#fff;">
          <!-- Red left accent on header -->
          <th style="padding:0;width:8px;background:#c0392b;"></th>
          <th style="padding:8px 10px;text-align:left;font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;width:38%;border-right:1px solid #2d3d5c;">Description</th>
          <th style="padding:8px 6px;text-align:center;font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;width:9%;border-right:1px solid #2d3d5c;">QTY</th>
          <th style="padding:8px 6px;text-align:center;font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;width:11%;border-right:1px solid #2d3d5c;">Unit</th>
          <th style="padding:8px 8px;text-align:right;font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;width:15%;border-right:1px solid #2d3d5c;">Unit Price</th>
          <th style="padding:8px 10px;text-align:right;font-size:8.5px;letter-spacing:.09em;text-transform:uppercase;width:15%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsWithAccent(items, padCount)}
      </tbody>
    </table>`;
}

function itemRowsWithAccent(items, padCount) {
  const allRows = [
    ...items.map((item, i) => ({
      desc: esc(item.desc), qty: esc(item.qty), unit: esc(item.unit),
      price: fmt(item.price), amount: fmt(item.amount), idx: i
    })),
    ...Array.from({length: padCount}, (_, i) => ({
      desc: '&nbsp;', qty: '', unit: '', price: '', amount: '', idx: items.length + i
    })),
  ];
  return allRows.map(r => `
    <tr style="background:${r.idx % 2 === 1 ? '#f4f6f9' : '#fff'};">
      <td style="background:${r.idx % 2 === 1 ? '#e8ebf0' : '#f0f2f5'};width:8px;padding:0;"></td>
      <td style="padding:7px 10px;border-right:1px solid #e0e4ea;">${r.desc}</td>
      <td style="padding:7px 6px;text-align:center;border-right:1px solid #e0e4ea;">${r.qty}</td>
      <td style="padding:7px 6px;text-align:center;border-right:1px solid #e0e4ea;">${r.unit}</td>
      <td style="padding:7px 8px;text-align:right;border-right:1px solid #e0e4ea;">${r.price}</td>
      <td style="padding:7px 10px;text-align:right;">${r.amount}</td>
    </tr>`).join('');
}

function bottomSectionHTML(data) {
  return `
    <div style="display:flex;gap:10px;margin:8px 28px 10px;align-items:flex-start;">

      <!-- Notes + Payment Terms -->
      <div style="flex:1;font-size:9px;">
        <!-- Notes -->
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          ${SVG_CLIPBOARD}
          <span style="font-weight:900;font-size:10px;color:#1a2744;letter-spacing:.06em;text-transform:uppercase;">NOTES</span>
        </div>
        <div style="color:#444;min-height:18px;border-bottom:1px solid #ccc;margin-bottom:4px;padding-bottom:2px;">${esc(data.notes).replace(/\n/g,'<br/>')}</div>
        <div style="border-bottom:1px solid #ccc;margin-bottom:4px;height:14px;"></div>
        <div style="border-bottom:1px solid #ccc;margin-bottom:10px;height:14px;"></div>

        <!-- Payment Terms -->
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          ${SVG_DOLLAR}
          <span style="font-weight:900;font-size:10px;color:#c0392b;letter-spacing:.06em;text-transform:uppercase;">PAYMENT TERMS</span>
        </div>
        <div style="font-weight:700;font-size:10px;color:#111;margin-bottom:3px;">Net 15 Days</div>
        <div style="color:#444;font-size:8.5px;line-height:1.5;">${esc(data.paymentTerms).replace(/\n/g,'<br/>')}</div>
      </div>

      <!-- Totals -->
      <div style="width:255px;flex-shrink:0;font-size:9.5px;border:1px solid #ddd;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #ddd;">
          <span style="font-weight:700;letter-spacing:.04em;">SUBTOTAL</span>
          <span style="font-weight:600;border-bottom:1px solid #999;min-width:80px;text-align:right;">$&nbsp;${data.subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #ddd;">
          <span style="font-weight:700;letter-spacing:.04em;">TAX (${data.taxRate}%)</span>
          <span style="border-bottom:1px solid #999;min-width:80px;text-align:right;">$&nbsp;${data.tax.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:#1a2744;color:#fff;border-bottom:2px solid #c0392b;">
          <span style="font-weight:900;letter-spacing:.06em;font-size:10px;">TOTAL</span>
          <span style="font-weight:700;font-size:11px;">$&nbsp;${data.total.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:#c0392b;color:#fff;">
          <span style="font-weight:900;letter-spacing:.06em;font-size:11px;text-transform:uppercase;">Balance Due</span>
          <span style="font-weight:900;font-size:13px;">$&nbsp;${data.total.toFixed(2)}</span>
        </div>
      </div>
    </div>`;
}

function footerHTML() {
  return `
    <div style="background:#1a2744;color:#fff;display:flex;align-items:stretch;margin-top:auto;">

      <!-- Company Info -->
      <div style="padding:16px 18px;font-size:8.5px;display:flex;flex-direction:column;gap:6px;min-width:185px;border-right:1px solid #2d3d5c;">
        <div style="font-weight:900;font-size:9px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;color:#fff;">Company Information</div>
        <div style="display:flex;align-items:flex-start;gap:5px;">
          <span style="font-size:10px;margin-top:-1px;">&#x1F4CD;</span>
          <span>${esc(COMPANY.address).replace(/\n/g,'<br/>')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="font-size:10px;">&#x1F4DE;</span>
          <span>${esc(COMPANY.phone)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="font-size:10px;">&#x2709;</span>
          <span>${esc(COMPANY.email)}</span>
        </div>
      </div>

      <!-- Steel photo placeholder (dark gradient simulating steel photo) -->
      <div style="width:195px;flex-shrink:0;background:linear-gradient(135deg,#2a3a55 0%,#1a2540 40%,#3a4a65 70%,#1e2d45 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <div style="font-size:28px;opacity:.25;transform:rotate(-15deg);letter-spacing:-2px;">▨▨▨</div>
      </div>

      <!-- Business License -->
      <div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 18px;gap:4px;border-right:1px solid #2d3d5c;border-left:1px solid #2d3d5c;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
          <span style="font-size:14px;">&#128196;</span>
          <div>
            <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#99aabb;">Business License No.</div>
            <div style="font-weight:900;font-size:16px;letter-spacing:.04em;color:#fff;">${esc(COMPANY.license)}</div>
          </div>
        </div>
      </div>

      <!-- Thank You -->
      <div style="flex:1;background:#0f1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 18px;text-align:center;gap:5px;">
        <div style="font-size:26px;font-style:italic;font-family:Georgia,serif;color:#fff;line-height:1;">Thank You!</div>
        <div style="font-size:8px;color:#99aabb;line-height:1.6;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;">We appreciate your business<br/>and look forward to<br/>working with you on<br/>future projects.</div>
      </div>
    </div>`;
}

// ── Build all pages ────────────────────────────────────────────
function buildAllPagesHTML(data) {
  const items = data.items;

  // Decide distribución de items por página
  const pages = [];
  if (items.length <= ITEMS_FIRST_PAGE) {
    pages.push(items);
  } else {
    pages.push(items.slice(0, ITEMS_FIRST_PAGE));
    let offset = ITEMS_FIRST_PAGE;
    while (offset < items.length) {
      pages.push(items.slice(offset, offset + ITEMS_CONT_PAGE));
      offset += ITEMS_CONT_PAGE;
    }
  }

  const totalPages = pages.length;

  return pages.map((slice, i) => {
    if (i === 0) return buildFirstPage(data, slice);
    return buildContinuationPage(data, slice, i + 1, totalPages);
  }).join('\n');
}

// ── PDF generation ────────────────────────────────────────────
function getPdfFilename(data) {
  const base = data.invoiceNo ? `Invoice_${data.invoiceNo}` : 'Invoice';
  return `${base}_MGSteel.pdf`;
}

async function downloadPDF() {
  const data = getFormData();
  invoicePreview.innerHTML = buildAllPagesHTML(data);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
  const pages = invoicePreview.querySelectorAll('.inv-page');

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      logging: false,
      width:  PAGE_W_PX,
      height: PAGE_H_PX,
      windowWidth:  PAGE_W_PX,
      windowHeight: PAGE_H_PX,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.97);
    if (i > 0) pdf.addPage('letter', 'portrait');
    // letter = 8.5" × 11", fill page edge-to-edge
    pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11);
  }

  pdf.save(getPdfFilename(data));
}

// ── Modal ─────────────────────────────────────────────────────
function openPreview() {
  const data = getFormData();
  invoicePreviewClone.innerHTML = buildAllPagesHTML(data);
  previewModal.hidden = false;
  document.body.style.overflow = 'hidden';
  scalePreview();
}

function scalePreview() {
  // Ancho disponible dentro del modal-content (descontando padding de 1.5rem × 2)
  const modalContent = previewModal.querySelector('.modal-content');
  const available = modalContent.clientWidth - 48; // 2 × 24px padding
  const scale = Math.min(1, available / PAGE_W_PX);
  invoicePreviewClone.style.transform = `scale(${scale})`;
  // Colapsa el espacio que quedaría vacío debajo del elemento escalado
  const totalPagesH = invoicePreviewClone.scrollHeight;
  invoicePreviewClone.style.marginBottom = `${totalPagesH * (scale - 1)}px`;
}

function closePreview() {
  previewModal.hidden = true;
  document.body.style.overflow = '';
  invoicePreviewClone.style.transform = '';
  invoicePreviewClone.style.marginBottom = '';
}

// ── Event listeners ───────────────────────────────────────────
addRowBtn.addEventListener('click', createRow);
taxRateEl.addEventListener('input', recalc);
previewBtn.addEventListener('click', openPreview);
modalClose.addEventListener('click', closePreview);
modalBackdrop.addEventListener('click', closePreview);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePreview(); });
window.addEventListener('resize', () => { if (!previewModal.hidden) scalePreview(); });
downloadBtn.addEventListener('click', downloadPDF);
modalDownload.addEventListener('click', async () => {
  invoicePreview.innerHTML = invoicePreviewClone.innerHTML;
  closePreview();
  const data = getFormData();
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
  const pages = invoicePreview.querySelectorAll('.inv-page');
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2, useCORS: true, logging: false,
      width: PAGE_W_PX, height: PAGE_H_PX,
      windowWidth: PAGE_W_PX, windowHeight: PAGE_H_PX,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.97);
    if (i > 0) pdf.addPage('letter', 'portrait');
    pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11);
  }
  pdf.save(getPdfFilename(data));
});

// ── Init ──────────────────────────────────────────────────────
(function init() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('invoiceDate').value = today;
  const due = new Date();
  due.setDate(due.getDate() + 15);
  document.getElementById('dueDate').value = due.toISOString().slice(0, 10);
  createRow();
  createRow();
  createRow();
})();
