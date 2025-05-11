import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ProjectForm } from "../project-form"

export const metadata: Metadata = {
  title: "Add Project | Yohannes Hoveniersbedrijf",
  description: "Add a new project",
}

export default async function NewProjectPage() {
  const supabase = createClient()

  const { data: clients } = await supabase.from("clients").select("id, name").order("name", { ascending: true })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Project</h1>
        <p className="text-muted-foreground">Create a new project record</p>
      </div>

      <ProjectForm clients={clients || []} />
    </div>
  )
}
