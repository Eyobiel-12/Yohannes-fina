import type { Database } from "@/lib/database.types"

type Invoice = Database["public"]["Tables"]["invoices"]["Row"]
type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"] & {
  projects?: {
    project_number: string
    title: string | null
  } | null
}
type Client = Database["public"]["Tables"]["clients"]["Row"]
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"]

export function generateInvoiceHTML(
  invoice: Invoice,
  invoiceItems: InvoiceItem[],
  client: Client,
  companySettings: CompanySettings,
): string {
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "€0,00"
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Calculate due date (14 days after invoice date)
  const invoiceDate = new Date(invoice.invoice_date)
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + 14)

  // Generate HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .company-info {
          margin-bottom: 20px;
        }
        .invoice-details, .client-details {
          background-color: #f5f5f5;
          padding: 15px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .totals table {
          margin-bottom: 0;
        }
        .payment-info {
          margin-top: 30px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <h1>${companySettings.company_name || "Company Name"}</h1>
          <div class="company-info">
            ${companySettings.address ? companySettings.address.replace(/\n/g, "<br>") : ""}
            ${companySettings.phone ? `<br>Tel: ${companySettings.phone}` : ""}
            ${companySettings.email ? `<br>Email: ${companySettings.email}` : ""}
            ${companySettings.kvk_number ? `<br>KVK: ${companySettings.kvk_number}` : ""}
            ${companySettings.btw_number ? `<br>BTW: ${companySettings.btw_number}` : ""}
            ${companySettings.iban ? `<br>IBAN: ${companySettings.iban}` : ""}
          </div>
        </div>
        <div>
          <h2>FACTUUR</h2>
        </div>
      </div>

      <div style="display: flex; gap: 20px;">
        <div class="invoice-details" style="flex: 1;">
          <h3>FACTUURGEGEVENS</h3>
          <p>Factuurnummer: ${invoice.invoice_number}</p>
          <p>Factuurdatum: ${formatDate(invoice.invoice_date)}</p>
          <p>Vervaldatum: ${formatDate(dueDate.toISOString())}</p>
          <p>Status: ${invoice.is_paid ? "Betaald" : "Openstaand"}</p>
        </div>

        <div class="client-details" style="flex: 1;">
          <h3>KLANTGEGEVENS</h3>
          <p>${client.name}</p>
          ${client.address ? client.address.replace(/\n/g, "<br>") : ""}
          ${client.kvk_number ? `<p>KVK: ${client.kvk_number}</p>` : ""}
          ${client.btw_number ? `<p>BTW: ${client.btw_number}</p>` : ""}
        </div>
      </div>

      <h3>FACTUURITEMS</h3>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Omschrijving</th>
            <th class="text-right">Uren</th>
            <th class="text-right">Tarief</th>
            <th class="text-right">Bedrag</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceItems
            .map(
              (item) => `
            <tr>
              <td>${item.projects ? item.projects.project_number : "-"}</td>
              <td>${item.description || "-"}</td>
              <td class="text-right">${item.quantity || 0}</td>
              <td class="text-right">${formatCurrency(item.unit_price)}</td>
              <td class="text-right">${formatCurrency(item.total)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotaal:</td>
            <td class="text-right">${formatCurrency(invoice.total_excl_vat)}</td>
          </tr>
          <tr>
            <td>BTW (${invoice.vat_percent || 21}%):</td>
            <td class="text-right">${formatCurrency(invoice.vat_amount)}</td>
          </tr>
          <tr>
            <td><strong>Totaal:</strong></td>
            <td class="text-right"><strong>${formatCurrency(invoice.total_incl_vat)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="payment-info">
        <h3>BETALINGSINFORMATIE</h3>
        <p>${companySettings.payment_terms || `Gelieve binnen 14 dagen te voldoen op rekeningnummer ${companySettings.iban || ""} onder vermelding van het factuurnummer, ten name van ${companySettings.company_name || ""}.`}</p>
      </div>

      <div class="footer">
        <p>${companySettings.company_name || "Company Name"}</p>
      </div>
    </body>
    </html>
  `
}
