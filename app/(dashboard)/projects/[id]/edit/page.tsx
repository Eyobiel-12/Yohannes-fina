import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectForm } from "../../project-form"

export const metadata: Metadata = {
  title: "Edit Project | Yohannes Hoveniersbedrijf",
  description: "Edit project details",
}

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const supabase = createClient()

  const { data: project } = await supabase.from("projects").select("*").eq("id", params.id).single()

  if (!project) {
    notFound()
  }

  const { data: clients } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground">Update project information</p>
      </div>

      <ProjectForm project={project} clients={clients || []} />
    </div>
  )
}
