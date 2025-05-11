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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  kvk_number: z.string().optional().or(z.literal("")),
  btw_number: z.string().optional().or(z.literal("")),
})

interface ClientFormProps {
  client?: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    kvk_number: string | null
    btw_number: string | null
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const isEditing = !!client

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      kvk_number: client?.kvk_number || "",
      btw_number: client?.btw_number || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      if (isEditing) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update({
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            address: values.address || null,
            kvk_number: values.kvk_number || null,
            btw_number: values.btw_number || null,
          })
          .eq("id", client.id)

        if (error) throw error

        toast({
          title: "Client updated",
          description: "The client has been updated successfully.",
        })
      } else {
        // Create new client
        const { error } = await supabase.from("clients").insert({
          user_id: userData.user.id,
          name: values.name,
          email: values.email || null,
          phone: values.phone || null,
          address: values.address || null,
          kvk_number: values.kvk_number || null,
          btw_number: values.btw_number || null,
        })

        if (error) throw error

        toast({
          title: "Client created",
          description: "The client has been created successfully.",
        })
      }

      router.push("/clients")
      router.refresh()
    } catch (error) {
      console.error("Error saving client:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save client. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/clients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to clients
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
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
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Client address" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
