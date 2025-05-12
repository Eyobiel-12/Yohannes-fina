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
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  invoice_number: z.string().min(1, { message: "Invoice number is required" }),
  invoice_date: z.string().min(1, { message: "Invoice date is required" }),
  vat_percent: z.number().min(0).max(100),
  notes: z.string().optional(),
  is_paid: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface InvoiceFormProps {
  invoice: {
    id: string
    invoice_number: string
    invoice_date: string
    vat_percent: number
    notes?: string
    is_paid: boolean
  }
}

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      vat_percent: invoice.vat_percent,
      notes: invoice.notes || "",
      is_paid: invoice.is_paid,
    },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          invoice_number: values.invoice_number,
          invoice_date: values.invoice_date,
          vat_percent: values.vat_percent,
          notes: values.notes,
          is_paid: values.is_paid,
        })
        .eq("id", invoice.id)

      if (error) throw error

      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      })

      router.push("/invoices")
      router.refresh()
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="invoice_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vat_percent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT Percentage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Invoice"}
        </Button>
      </form>
    </Form>
  )
} 