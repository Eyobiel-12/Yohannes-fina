import type { Metadata } from "next"
import { ClientForm } from "../client-form"

export const metadata: Metadata = {
  title: "Add Client | Yohannes Hoveniersbedrijf",
  description: "Add a new client",
}

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Client</h1>
        <p className="text-muted-foreground">Create a new client record</p>
      </div>

      <ClientForm />
    </div>
  )
}
