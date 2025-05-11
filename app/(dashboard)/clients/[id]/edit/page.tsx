import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "../../client-form"

export const metadata: Metadata = {
  title: "Edit Client | Yohannes Hoveniersbedrijf",
  description: "Edit client details",
}

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const supabase = createClient()

  const { data: client } = await supabase.from("clients").select("*").eq("id", params.id).single()

  if (!client) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground">Update client information</p>
      </div>

      <ClientForm client={client} />
    </div>
  )
}
