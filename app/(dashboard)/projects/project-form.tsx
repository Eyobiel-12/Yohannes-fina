"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  client_id: z.string().min(1, { message: "Client is required" }),
  project_number: z.string().min(1, { message: "Project number is required" }),
  title: z.string().optional(),
  description: z.string().optional(),
})

interface Client {
  id: string
  name: string
}

interface ProjectFormProps {
  project?: {
    id: string
    client_id: string
    project_number: string
    title: string | null
    description: string | null
  }
  clients?: Client[]
}

export function ProjectForm({ project, clients: initialClients }: ProjectFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>(initialClients || [])
  const supabase = createClient()
  const isEditing = !!project

  // Get client_id from URL if present (for creating a project from client page)
  const clientIdFromUrl = searchParams.get("client")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: project?.client_id || clientIdFromUrl || "",
      project_number: project?.project_number || "",
      title: project?.title || "",
      description: project?.description || "",
    },
  })

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      if (isEditing) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            client_id: values.client_id,
            project_number: values.project_number,
            title: values.title || null,
            description: values.description || null,
          })
          .eq("id", project.id)

        if (error) throw error

        toast({
          title: "Project updated",
          description: "The project has been updated successfully.",
        })
      } else {
        // Create new project
        const { error } = await supabase.from("projects").insert({
          user_id: userData.user.id,
          client_id: values.client_id,
          project_number: values.project_number,
          title: values.title || null,
          description: values.description || null,
        })

        if (error) throw error

        toast({
          title: "Project created",
          description: "The project has been created successfully.",
        })
      }

      router.push("/projects")
      router.refresh()
    } catch (error) {
      console.error("Error saving project:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save project. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to projects
      </Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
              name="project_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Project number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Project description" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Project"
                  : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
