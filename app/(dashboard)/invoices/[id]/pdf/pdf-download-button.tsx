"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

type Invoice = any
type InvoiceItem = any
type Client = any
type CompanySettings = any

interface PDFDownloadButtonProps {
  invoice: Invoice
  client: Client
  items: InvoiceItem[]
  companySettings: CompanySettings
}

export function PDFDownloadButton({ invoice, client, items, companySettings }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      // Create a new PDF document
      const doc = new jsPDF()

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

      // Set font
      doc.setFont("helvetica")

      // Add company header
      doc.setFontSize(20)
      doc.text(companySettings.company_name || "Your Company", 14, 20)
      
      // Add company info
      doc.setFontSize(10)
      let companyY = 25
      
      if (companySettings.address) {
        const addressLines = companySettings.address.split("\n")
        addressLines.forEach((line: string) => {
          doc.text(line, 14, companyY)
          companyY += 5
        })
      }
      
      if (companySettings.phone) {
        doc.text(`Tel: ${companySettings.phone}`, 14, companyY)
        companyY += 5
      }
      
      if (companySettings.email) {
        doc.text(`Email: ${companySettings.email}`, 14, companyY)
        companyY += 5
      }

      // Add invoice title
      doc.setFontSize(18)
      doc.text("INVOICE", 195, 20, { align: "right" })
      
      // Add invoice details
      doc.setFontSize(10)
      doc.text(`Invoice Number: ${invoice.invoice_number}`, 195, 30, { align: "right" })
      doc.text(`Date: ${formatDate(invoice.invoice_date)}`, 195, 35, { align: "right" })
      doc.text(`Due Date: ${formatDate(dueDate.toISOString())}`, 195, 40, { align: "right" })
      doc.text(`Status: ${invoice.is_paid ? "Paid" : "Unpaid"}`, 195, 45, { align: "right" })

      // Add client info box
      doc.setDrawColor(200, 200, 200)
      doc.rect(14, 60, 85, 40)
      
      doc.setFontSize(11)
      doc.text("Bill To:", 16, 65)
      
      doc.setFontSize(10)
      doc.text(client.name, 16, 72)
      
      let clientY = 77
      if (client.address) {
        const addressLines = client.address.split("\n")
        addressLines.forEach((line: string) => {
          doc.text(line, 16, clientY)
          clientY += 5
        })
      }
      
      if (client.kvk_number) {
        doc.text(`KVK: ${client.kvk_number}`, 16, clientY)
        clientY += 5
      }
      
      if (client.btw_number) {
        doc.text(`BTW: ${client.btw_number}`, 16, clientY)
      }

      // Add invoice items table
      const tableColumn = ["Project", "Description", "Quantity", "Unit Price", "Total"]
      const tableRows = items.map((item: any) => [
        item.projects ? item.projects.project_number : "-",
        item.description || "-",
        item.quantity || 0,
        formatCurrency(item.unit_price),
        formatCurrency(item.total)
      ])

      // Add invoice items table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 110,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 40, 40] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      })
      
      // Get the Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 10

      // Add totals
      doc.text("Subtotal:", 140, finalY)
      doc.text(formatCurrency(invoice.total_excl_vat), 195, finalY, { align: "right" })
      
      doc.text(`VAT (${invoice.vat_percent || 21}%):`, 140, finalY + 5)
      doc.text(formatCurrency(invoice.vat_amount), 195, finalY + 5, { align: "right" })
      
      doc.setFont("helvetica", "bold")
      doc.text("Total:", 140, finalY + 10)
      doc.text(formatCurrency(invoice.total_incl_vat), 195, finalY + 10, { align: "right" })
      doc.setFont("helvetica", "normal")

      // Add payment information
      doc.setFontSize(11)
      doc.text("Payment Information", 14, finalY + 25)
      doc.setFontSize(10)
      
      const paymentText = companySettings.payment_terms || 
        `Please pay within 14 days to ${companySettings.iban || ""} referencing invoice number ${invoice.invoice_number}.`
      
      doc.text(paymentText, 14, finalY + 32)

      // Add footer
      doc.setFontSize(8)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 280)
      doc.text(companySettings.company_name || "Your Company", 195, 280, { align: "right" })

      // Save the PDF
      doc.save(`Invoice-${invoice.invoice_number}.pdf`)
      
      toast({
        title: "PDF Generated",
        description: "Your invoice has been downloaded as a PDF",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating}>
      <Download className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </Button>
  )
} 