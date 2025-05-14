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
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <span className="inline-block bg-green-100 text-green-700 rounded-full p-2 mr-2">
              ✏️
            </span>
            Edit Client
          </h1>
          <p className="text-muted-foreground text-base">Update client information</p>
        </div>
        <ClientForm client={client} />
      </div>
    </div>
  )
}
