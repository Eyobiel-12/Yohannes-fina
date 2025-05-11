"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Paperclip } from "lucide-react"

const formSchema = z.object({
  to: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
})

interface SendInvoiceFormProps {
  invoice: {
    id: string
    invoice_number: string
    clients: {
      name: string
      email: string | null
    }
  }
  companySettings: {
    company_name: string | null
  } | null
  clientEmail: string | null
}

export function SendInvoiceForm({ invoice, companySettings, clientEmail }: SendInvoiceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const defaultSubject = `Invoice ${invoice.invoice_number} from ${companySettings?.company_name || "Our Company"}`
  const defaultMessage = `Dear ${invoice.clients.name},

Please find attached invoice ${invoice.invoice_number}.

Thank you for your business.

Best regards,
${companySettings?.company_name || "Our Company"}`

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: clientEmail || "",
      subject: defaultSubject,
      message: defaultMessage,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // In a real application, you would send this to your API endpoint
      // that would handle sending the email with the PDF attachment

      // For now, we'll simulate a successful email send
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Email sent",
        description: `Invoice ${invoice.invoice_number} has been sent to ${values.to}`,
      })

      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Invoice by Email</CardTitle>
        <CardDescription>The invoice will be sent as an attachment to the specified email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border p-4 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span>
                Invoice-{invoice.invoice_number}.html <span className="text-muted-foreground">(will be attached)</span>
              </span>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/invoices/${invoice.id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
