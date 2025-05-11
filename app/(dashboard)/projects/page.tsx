import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { ProjectsTable } from "./projects-table"

export const metadata: Metadata = {
  title: "Projects | Yohannes Hoveniersbedrijf",
  description: "Manage your projects",
}

export default async function ProjectsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      clients (
        id,
        name
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your project information</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <ProjectsTable projects={projects || []} />
    </div>
  )
}
