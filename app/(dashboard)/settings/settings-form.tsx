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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  address: z.string().optional().or(z.literal("")),
  kvk_number: z.string().optional().or(z.literal("")),
  btw_number: z.string().optional().or(z.literal("")),
  iban: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  vat_default: z.coerce.number().min(0).max(100).default(21),
  payment_terms: z.string().optional().or(z.literal("")),
})

interface SettingsFormProps {
  settings?: {
    id: string
    company_name: string | null
    address: string | null
    kvk_number: string | null
    btw_number: string | null
    iban: string | null
    phone: string | null
    email: string | null
    vat_default: number | null
    payment_terms: string | null
  }
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: settings?.company_name || "",
      address: settings?.address || "",
      kvk_number: settings?.kvk_number || "",
      btw_number: settings?.btw_number || "",
      iban: settings?.iban || "",
      phone: settings?.phone || "",
      email: settings?.email || "",
      vat_default: settings?.vat_default || 21,
      payment_terms: settings?.payment_terms || "Binnen 2 dagen o.v.v. factuurnummer op NL44ABNA0108854914",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      if (settings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from("company_settings")
          .update({
            company_name: values.company_name,
            address: values.address || null,
            kvk_number: values.kvk_number || null,
            btw_number: values.btw_number || null,
            iban: values.iban || null,
            phone: values.phone || null,
            email: values.email || null,
            vat_default: values.vat_default,
            payment_terms: values.payment_terms || null,
          })
          .eq("id", settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase.from("company_settings").insert({
          user_id: userData.user.id,
          company_name: values.company_name,
          address: values.address || null,
          kvk_number: values.kvk_number || null,
          btw_number: values.btw_number || null,
          iban: values.iban || null,
          phone: values.phone || null,
          email: values.email || null,
          vat_default: values.vat_default,
          payment_terms: values.payment_terms || null,
        })

        if (error) throw error
      }

      toast({
        title: "Settings saved",
        description: "Your company settings have been saved successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>These details will appear on your invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kvk_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KvK Number</FormLabel>
                    <FormControl>
                      <Input placeholder="KvK number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="btw_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BTW Number</FormLabel>
                    <FormControl>
                      <Input placeholder="BTW number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input placeholder="IBAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default VAT %</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Company address" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Payment terms" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
