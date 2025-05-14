"use client"

import { useState, useEffect, useRef } from "react"
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
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react"
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
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null)
  const [shake, setShake] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate card entrance
    if (cardRef.current) {
      cardRef.current.classList.add("animate-fade-in-up")
    }
  }, [])

  useEffect(() => {
    if (feedback?.type === "error") {
      setShake(true)
      const timeout = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [feedback])

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
    setFeedback(null)
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

        setFeedback({ type: "success", message: "Client updated successfully!" })
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

        setFeedback({ type: "success", message: "Client created successfully!" })
      }

      setTimeout(() => router.push("/clients"), 900)
      router.refresh()
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to save client. Please try again." })
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
    <div ref={cardRef} className={`space-y-6 transition-all duration-500 ${shake ? "animate-shake" : ""} animate-fade-in-up`}>
      <Link href="/clients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to clients
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                    <span className="text-green-600">👤</span> Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=" "
                      {...field}
                      className="peer bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                    <span className="text-green-600">✉️</span> Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=" "
                      {...field}
                      className="peer bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                    <span className="text-green-600">📞</span> Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=" "
                      {...field}
                      className="peer bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kvk_number"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                    <span className="text-green-600">🏢</span> KvK Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=" "
                      {...field}
                      className="peer bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="btw_number"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                    <span className="text-green-600">💳</span> BTW Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder=" "
                      {...field}
                      className="peer bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    />
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
              <FormItem className="relative">
                <FormLabel className="flex items-center gap-2 absolute left-3 top-2.5 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 z-10 bg-white/70 px-1 rounded">
                  <span className="text-green-600">🏠</span> Address
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder=" "
                    className="peer resize-none bg-white/70 backdrop-blur rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 shadow-sm focus:shadow-green-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div aria-live="polite" className="min-h-[32px] flex items-center">
            {feedback?.type === "success" && (
              <span className="flex items-center gap-2 text-green-600 animate-fade-in">
                <CheckCircle className="h-5 w-5" /> {feedback.message}
              </span>
            )}
            {feedback?.type === "error" && (
              <span className="flex items-center gap-2 text-red-600 animate-fade-in">
                <XCircle className="h-5 w-5" /> {feedback.message}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/clients")}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-green-200 focus:shadow-green-200"
            >
              <span className="z-10 relative">Cancel</span>
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-green-200 focus:shadow-green-200 bg-green-600 text-white hover:bg-green-700 focus:bg-green-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span className="z-10 relative">{isEditing ? "Update Client" : "Create Client"}</span>
              )}
              <span className="absolute inset-0 pointer-events-none" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
