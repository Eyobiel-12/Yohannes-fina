"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  project_id: z.string().optional().nullable(),
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.coerce.number().min(0.01, { message: "Quantity must be greater than 0" }),
  unit_price: z.coerce.number().min(0.01, { message: "Unit price must be greater than 0" }),
  total: z.coerce.number().optional(),
})

const formSchema = z.object({
  client_id: z.string().min(1, { message: "Client is required" }),
  invoice_number: z.string().min(1, { message: "Invoice number is required" }),
  invoice_date: z.string().min(1, { message: "Invoice date is required" }),
  is_paid: z.boolean().default(false),
  vat_percent: z.coerce.number().min(0, { message: "VAT percentage must be 0 or greater" }),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required" }),
})

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  project_number: string
  title: string | null
}

interface InvoiceFormProps {
  invoice?: {
    id: string
    client_id: string
    invoice_number: string
    invoice_date: string
    is_paid: boolean
    vat_percent: number | null
    total_excl_vat: number | null
    vat_amount: number | null
    total_incl_vat: number | null
  }
  invoiceItems?: {
    id: string
    project_id: string | null
    description: string | null
    quantity: number | null
    unit_price: number | null
    total: number | null
  }[]
  clients?: Client[]
  defaultVat?: number
}

export function InvoiceForm({ invoice, invoiceItems, clients: initialClients, defaultVat = 21 }: InvoiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>(initialClients || [])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>(
    invoice?.client_id || searchParams.get("client") || "",
  )
  const [invoiceTotals, setInvoiceTotals] = useState({
    totalExclVat: 0,
    vatAmount: 0,
    totalInclVat: 0,
  })
  const supabase = createClient()
  const isEditing = !!invoice

  // Generate a default invoice number if creating a new invoice
  const generateInvoiceNumber = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `FY${year}-${month}-${random}`
  }

  // Format today's date as YYYY-MM-DD for the date input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: invoice?.client_id || searchParams.get("client") || "",
      invoice_number: invoice?.invoice_number || generateInvoiceNumber(),
      invoice_date: invoice?.invoice_date || formatDateForInput(new Date()),
      is_paid: invoice?.is_paid || false,
      vat_percent: invoice?.vat_percent || defaultVat,
      notes: "",
      items: invoiceItems?.map((item) => ({
        id: item.id,
        project_id: item.project_id || undefined,
        description: item.description || "",
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || 0,
      })) || [
        {
          project_id: searchParams.get("project") || undefined,
          description: "",
          quantity: 1,
          unit_price: 0,
          total: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Calculate totals without using setValue to avoid stack overflow
  const calculateTotals = () => {
    try {
      const items = form.getValues("items") || []
      const vatPercent = form.getValues("vat_percent") || 0

      // Calculate invoice totals
      let totalExclVat = 0

      // Sum up the totals from each item
      for (const item of items) {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        const itemTotal = quantity * unitPrice
        totalExclVat += itemTotal
      }

      const vatAmount = (totalExclVat * vatPercent) / 100
      const totalInclVat = totalExclVat + vatAmount

      // Update state for display purposes
      setInvoiceTotals({
        totalExclVat,
        vatAmount,
        totalInclVat,
      })

      return {
        totalExclVat,
        vatAmount,
        totalInclVat,
      }
    } catch (error) {
      console.error("Error calculating totals:", error)
      return {
        totalExclVat: 0,
        vatAmount: 0,
        totalInclVat: 0,
      }
    }
  }

  // Fetch clients if not provided
  useEffect(() => {
    if (!initialClients) {
      const fetchClients = async () => {
        const { data } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

        if (data) {
          setClients(data)
        }
      }

      fetchClients()
    }
  }, [initialClients, supabase])

  // Fetch projects for selected client
  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedClientId) {
        const { data } = await supabase
          .from("projects")
          .select("id, project_number, title")
          .eq("client_id", selectedClientId)
          .order("project_number", { ascending: true })

        if (data) {
          setProjects(data)
        }
      } else {
        setProjects([])
      }
    }

    fetchProjects()
  }, [selectedClientId, supabase])

  // Update selected client when form value changes
  useEffect(() => {
    const clientId = form.getValues("client_id")
    if (clientId && clientId !== selectedClientId) {
      setSelectedClientId(clientId)
    }

    // Initial calculation
    calculateTotals()
  }, [])

  // Handle quantity change
  const handleQuantityChange = (index: number, value: string) => {
    try {
      const quantity = Number.parseFloat(value) || 0
      form.setValue(`items.${index}.quantity`, quantity)

      // Calculate and update the item total
      const unitPrice = form.getValues(`items.${index}.unit_price`) || 0
      const total = quantity * unitPrice
      form.setValue(`items.${index}.total`, total)

      // Recalculate invoice totals
      calculateTotals()
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  // Handle unit price change
  const handleUnitPriceChange = (index: number, value: string) => {
    try {
      const unitPrice = Number.parseFloat(value) || 0
      form.setValue(`items.${index}.unit_price`, unitPrice)

      // Calculate and update the item total
      const quantity = form.getValues(`items.${index}.quantity`) || 0
      const total = quantity * unitPrice
      form.setValue(`items.${index}.total`, total)

      // Recalculate invoice totals
      calculateTotals()
    } catch (error) {
      console.error("Error updating unit price:", error)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      // Calculate totals
      const { totalExclVat, vatAmount, totalInclVat } = calculateTotals()

      // Update item totals before submission
      const itemsWithTotals = values.items.map((item) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        return {
          ...item,
          total: quantity * unitPrice,
        }
      })

      if (isEditing) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({
            client_id: values.client_id,
            invoice_number: values.invoice_number,
            invoice_date: values.invoice_date,
            is_paid: values.is_paid,
            vat_percent: values.vat_percent,
            total_excl_vat: totalExclVat,
            vat_amount: vatAmount,
            total_incl_vat: totalInclVat,
            // Remove the notes field from the update
          })
          .eq("id", invoice.id)

        if (invoiceError) throw invoiceError

        // Handle invoice items
        // First, delete all existing items
        const { error: deleteError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoice.id)

        if (deleteError) throw deleteError

        // Then, insert new items
        const { error: itemsError } = await supabase.from("invoice_items").insert(
          itemsWithTotals.map((item) => ({
            invoice_id: invoice.id,
            project_id: item.project_id === "no-project" ? null : item.project_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          })),
        )

        if (itemsError) throw itemsError

        toast({
          title: "Invoice updated",
          description: "The invoice has been updated successfully.",
        })
      } else {
        // Create new invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            user_id: userData.user.id,
            client_id: values.client_id,
            invoice_number: values.invoice_number,
            invoice_date: values.invoice_date,
            is_paid: values.is_paid,
            vat_percent: values.vat_percent,
            total_excl_vat: totalExclVat,
            vat_amount: vatAmount,
            total_incl_vat: totalInclVat,
            // Remove the notes field from the insert
          })
          .select()
          .single()

        if (invoiceError) throw invoiceError

        // Insert invoice items
        const { error: itemsError } = await supabase.from("invoice_items").insert(
          itemsWithTotals.map((item) => ({
            invoice_id: invoiceData.id,
            project_id: item.project_id === "no-project" ? null : item.project_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          })),
        )

        if (itemsError) throw itemsError

        toast({
          title: "Invoice created",
          description: "The invoice has been created successfully.",
        })
      }

      router.push("/invoices")
      router.refresh()
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save invoice. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to invoices
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedClientId(value)
                        }}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          step="0.01"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // Recalculate totals after VAT percent changes
                            setTimeout(() => calculateTotals(), 0)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Mark as Paid</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                    }).format(invoiceTotals.totalExclVat)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span>VAT ({form.getValues("vat_percent")}%):</span>
                  <span>
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                    }).format(invoiceTotals.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-4 font-bold">
                  <span>Total:</span>
                  <span>
                    {new Intl.NumberFormat("nl-NL", {
                      style: "currency",
                      currency: "EUR",
                    }).format(invoiceTotals.totalInclVat)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 rounded-md border p-4 md:grid-cols-12">
                    <FormField
                      control={form.control}
                      name={`items.${index}.project_id`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel>Project</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={isLoading || !selectedClientId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no-project">No project</SelectItem>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.project_number}
                                  {project.title ? `: ${project.title}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={field.value}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={field.value}
                              onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.total`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Total</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                (form.getValues(`items.${index}.quantity`) || 0) *
                                (form.getValues(`items.${index}.unit_price`) || 0)
                              }
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          remove(index)
                          // Recalculate totals after removing an item
                          setTimeout(() => calculateTotals(), 0)
                        }}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    append({
                      project_id: undefined,
                      description: "",
                      quantity: 1,
                      unit_price: 0,
                      total: 0,
                    })
                    // Calculate totals after adding a new item
                    setTimeout(() => calculateTotals(), 0)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or payment instructions (these will not be saved to the database)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Invoice"
                  : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
