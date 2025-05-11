import { jsPDF } from "jspdf"
import "jspdf-autotable"
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

export async function generateInvoicePdf(
  invoice: Invoice,
  invoiceItems: InvoiceItem[],
  client: Client,
  companySettings: CompanySettings,
) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set document properties
  doc.setProperties({
    title: `Invoice ${invoice.invoice_number}`,
    subject: "Invoice",
    author: companySettings.company_name || "Company",
    creator: "Invoice Generator",
  })

  // Add fonts
  doc.setFont("helvetica", "normal")

  // Define colors
  const primaryColor = [0, 0, 0] // Black
  const secondaryColor = [100, 100, 100] // Dark gray

  // Set initial position
  let y = 20

  // Add company logo and header
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFont("helvetica", "bold")
  doc.text(companySettings.company_name || "Company Name", 20, y)
  doc.setFontSize(14)
  doc.text("FACTUUR", 170, y, { align: "right" })

  // Add company details
  y += 10
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])

  if (companySettings.address) {
    const addressLines = companySettings.address.split("\n")
    for (const line of addressLines) {
      doc.text(line, 20, y)
      y += 4
    }
  }

  if (companySettings.phone) {
    doc.text(`Tel: ${companySettings.phone}`, 20, y)
    y += 4
  }

  if (companySettings.email) {
    doc.text(`Email: ${companySettings.email}`, 20, y)
    y += 4
  }

  if (companySettings.kvk_number) {
    doc.text(`KVK: ${companySettings.kvk_number}`, 20, y)
    y += 4
  }

  if (companySettings.btw_number) {
    doc.text(`BTW: ${companySettings.btw_number}`, 20, y)
    y += 4
  }

  if (companySettings.iban) {
    doc.text(`IBAN: ${companySettings.iban}`, 20, y)
    y += 10
  }

  // Add invoice details section
  y += 5
  doc.setFillColor(240, 240, 240)
  doc.rect(20, y, 80, 30, "F")
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setFont("helvetica", "bold")
  doc.text("FACTUURGEGEVENS", 25, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Factuurnummer: ${invoice.invoice_number}`, 25, y + 12)
  doc.text(`Factuurdatum: ${formatDate(invoice.invoice_date)}`, 25, y + 18)

  // Calculate due date (14 days after invoice date)
  const invoiceDate = new Date(invoice.invoice_date)
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + 14)
  doc.text(`Vervaldatum: ${formatDate(dueDate.toISOString())}`, 25, y + 24)

  doc.text(`Status: ${invoice.is_paid ? "Betaald" : "Openstaand"}`, 25, y + 30)

  // Add client details section
  doc.setFillColor(240, 240, 240)
  doc.rect(110, y, 80, 30, "F")
  doc.setFont("helvetica", "bold")
  doc.text("KLANTGEGEVENS", 115, y + 6)
  doc.setFont("helvetica", "normal")
  doc.text(client.name, 115, y + 12)

  if (client.address) {
    const clientAddressLines = client.address.split("\n")
    let clientY = y + 18
    for (const line of clientAddressLines) {
      doc.text(line, 115, clientY)
      clientY += 5
    }
  }

  if (client.kvk_number) {
    doc.text(`KVK: ${client.kvk_number}`, 115, y + 24)
  }

  if (client.btw_number) {
    doc.text(`BTW: ${client.btw_number}`, 115, y + 30)
  }

  // Add invoice items table
  y += 40
  doc.setFont("helvetica", "bold")
  doc.text("FACTUURITEMS", 20, y)
  y += 5

  // Define table columns
  const tableColumns = [
    { header: "Project", dataKey: "project" },
    { header: "Omschrijving", dataKey: "description" },
    { header: "Uren", dataKey: "quantity" },
    { header: "Tarief", dataKey: "unitPrice" },
    { header: "Bedrag", dataKey: "total" },
  ]

  // Prepare table data
  const tableData = invoiceItems.map((item) => {
    return {
      project: item.projects ? `${item.projects.project_number}` : "-",
      description: item.description || "-",
      quantity: formatNumber(item.quantity || 0),
      unitPrice: formatCurrency(item.unit_price || 0),
      total: formatCurrency(item.total || 0),
    }
  })

  // Add table
  // @ts-ignore - jspdf-autotable extends jsPDF prototype
  doc.autoTable({
    startY: y,
    head: [tableColumns.map((col) => col.header)],
    body: tableData.map((row) => tableColumns.map((col) => row[col.dataKey as keyof typeof row])),
    theme: "grid",
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Project
      1: { cellWidth: 70 }, // Description
      2: { cellWidth: 20, halign: "right" }, // Quantity
      3: { cellWidth: 30, halign: "right" }, // Unit Price
      4: { cellWidth: 30, halign: "right" }, // Total
    },
  })

  // Get the final Y position after the table
  // @ts-ignore - jspdf-autotable extends jsPDF prototype
  y = doc.lastAutoTable.finalY + 10

  // Add totals
  const totalsX = 150
  doc.setFont("helvetica", "normal")
  doc.text("Subtotaal:", totalsX, y)
  doc.text(formatCurrency(invoice.total_excl_vat || 0), 190, y, { align: "right" })

  y += 6
  doc.text(`BTW (${formatNumber(invoice.vat_percent || 21)}%):`, totalsX, y)
  doc.text(formatCurrency(invoice.vat_amount || 0), 190, y, { align: "right" })

  y += 6
  doc.setFont("helvetica", "bold")
  doc.text("Totaal:", totalsX, y)
  doc.text(formatCurrency(invoice.total_incl_vat || 0), 190, y, { align: "right" })

  // Add payment information
  y += 15
  doc.setFont("helvetica", "bold")
  doc.text("BETALINGSINFORMATIE", 20, y)
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const paymentTerms =
    companySettings.payment_terms ||
    `Gelieve binnen 14 dagen te voldoen op rekeningnummer ${companySettings.iban || ""} onder vermelding van het factuurnummer, ten name van ${companySettings.company_name || ""}.`

  // Handle multi-line payment terms
  const splitPaymentTerms = doc.splitTextToSize(paymentTerms, 170)
  doc.text(splitPaymentTerms, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`${companySettings.company_name || "Company Name"} - Pagina ${i} van ${pageCount}`, 105, 285, {
      align: "center",
    })
  }

  return doc
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatNumber(num: number): string {
  return num.toString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}
