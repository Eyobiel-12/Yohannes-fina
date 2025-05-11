import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Helper function to generate random dates within a range
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Format date to ISO string with only the date part
function formatDateToISO(date: Date) {
  return date.toISOString().split("T")[0]
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id

    // Check if user already has data
    const { count } = await supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId)

    if (count && count > 0) {
      return NextResponse.json({ message: "Sample data already exists for this user" }, { status: 200 })
    }

    // Insert company settings
    const { data: companySettings, error: companyError } = await supabase
      .from("company_settings")
      .insert({
        user_id: userId,
        company_name: "Yohannes Hoveniersbedrijf B.V.",
        address: "Hoofdstraat 123\n1234 AB Amsterdam\nNetherlands",
        kvk_number: "76543210",
        btw_number: "NL123456789B01",
        iban: "NL91ABNA0417164300",
        phone: "+31 20 123 4567",
        email: "info@yohanneshoveniers.nl",
        vat_default: 21,
        payment_terms: "Betaling binnen 14 dagen na factuurdatum. Vermeld het factuurnummer bij de betaling.",
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json({ error: "Error creating company settings", details: companyError }, { status: 500 })
    }

    // Insert clients
    const { data: client1, error: client1Error } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name: "Gemeente Amsterdam",
        address: "Amstel 1\n1011 PN Amsterdam\nNetherlands",
        kvk_number: "34366966",
        btw_number: "NL002564440B01",
        phone: "+31 20 624 1111",
        email: "info@amsterdam.nl",
      })
      .select()
      .single()

    if (client1Error) {
      return NextResponse.json({ error: "Error creating client 1", details: client1Error }, { status: 500 })
    }

    const { data: client2, error: client2Error } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name: "De Groene Tuin B.V.",
        address: "Tuinstraat 45\n1015 PW Amsterdam\nNetherlands",
        kvk_number: "54321098",
        btw_number: "NL854123789B01",
        phone: "+31 20 987 6543",
        email: "contact@degroenetuin.nl",
      })
      .select()
      .single()

    if (client2Error) {
      return NextResponse.json({ error: "Error creating client 2", details: client2Error }, { status: 500 })
    }

    const { data: client3, error: client3Error } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name: "Wooncomplex De Eik",
        address: "Eikenweg 78\n1092 BB Amsterdam\nNetherlands",
        kvk_number: "87654321",
        btw_number: "NL987654321B01",
        phone: "+31 20 345 6789",
        email: "beheer@wooncomplexdeeik.nl",
      })
      .select()
      .single()

    if (client3Error) {
      return NextResponse.json({ error: "Error creating client 3", details: client3Error }, { status: 500 })
    }

    // Insert projects
    const { data: project1, error: project1Error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        client_id: client1.id,
        project_number: "PRJ-2023-001",
        title: "Vondelpark Onderhoud",
        description:
          "Regulier onderhoud van de zuidelijke secties van het Vondelpark, inclusief snoeien, maaien en plantenbedden verzorgen.",
      })
      .select()
      .single()

    if (project1Error) {
      return NextResponse.json({ error: "Error creating project 1", details: project1Error }, { status: 500 })
    }

    const { data: project2, error: project2Error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        client_id: client2.id,
        project_number: "PRJ-2023-002",
        title: "Aanleg Bedrijfstuin",
        description:
          "Ontwerp en aanleg van een nieuwe bedrijfstuin met duurzame beplanting, waterpartij en zitgedeelte.",
      })
      .select()
      .single()

    if (project2Error) {
      return NextResponse.json({ error: "Error creating project 2", details: project2Error }, { status: 500 })
    }

    const { data: project3, error: project3Error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        client_id: client3.id,
        project_number: "PRJ-2023-003",
        title: "Renovatie Binnenplaats",
        description:
          "Volledige renovatie van de binnenplaats, inclusief nieuwe bestrating, beplanting en irrigatiesysteem.",
      })
      .select()
      .single()

    if (project3Error) {
      return NextResponse.json({ error: "Error creating project 3", details: project3Error }, { status: 500 })
    }

    const { data: project4, error: project4Error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        client_id: client1.id,
        project_number: "PRJ-2023-004",
        title: "Seizoensplanting Stadsparken",
        description: "Seizoensgebonden beplanting voor diverse stadsparken in Amsterdam-Zuid.",
      })
      .select()
      .single()

    if (project4Error) {
      return NextResponse.json({ error: "Error creating project 4", details: project4Error }, { status: 500 })
    }

    // Insert invoices and invoice items
    // Invoice 1 (Paid, older)
    const invoice1Date = formatDateToISO(randomDate(new Date(2023, 0, 1), new Date(2023, 0, 31)))
    const { data: invoice1, error: invoice1Error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: client1.id,
        invoice_number: "FY2023-01-001",
        invoice_date: invoice1Date,
        total_excl_vat: 3500.0,
        vat_percent: 21,
        vat_amount: 735.0,
        total_incl_vat: 4235.0,
        is_paid: true,
      })
      .select()
      .single()

    if (invoice1Error) {
      return NextResponse.json({ error: "Error creating invoice 1", details: invoice1Error }, { status: 500 })
    }

    const { error: invoice1ItemError } = await supabase.from("invoice_items").insert({
      invoice_id: invoice1.id,
      project_id: project1.id,
      description: "Maandelijks onderhoud Vondelpark - Januari 2023",
      quantity: 80,
      unit_price: 43.75,
      total: 3500.0,
    })

    if (invoice1ItemError) {
      return NextResponse.json({ error: "Error creating invoice 1 item", details: invoice1ItemError }, { status: 500 })
    }

    // Invoice 2 (Paid, recent)
    const invoice2Date = formatDateToISO(randomDate(new Date(2023, 3, 1), new Date(2023, 3, 30)))
    const { data: invoice2, error: invoice2Error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: client2.id,
        invoice_number: "FY2023-04-002",
        invoice_date: invoice2Date,
        total_excl_vat: 7250.0,
        vat_percent: 21,
        vat_amount: 1522.5,
        total_incl_vat: 8772.5,
        is_paid: true,
      })
      .select()
      .single()

    if (invoice2Error) {
      return NextResponse.json({ error: "Error creating invoice 2", details: invoice2Error }, { status: 500 })
    }

    const { error: invoice2Item1Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice2.id,
      project_id: project2.id,
      description: "Ontwerp bedrijfstuin",
      quantity: 1,
      unit_price: 1250.0,
      total: 1250.0,
    })

    if (invoice2Item1Error) {
      return NextResponse.json(
        { error: "Error creating invoice 2 item 1", details: invoice2Item1Error },
        { status: 500 },
      )
    }

    const { error: invoice2Item2Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice2.id,
      project_id: project2.id,
      description: "Aanleg bedrijfstuin - Materialen",
      quantity: 1,
      unit_price: 3500.0,
      total: 3500.0,
    })

    if (invoice2Item2Error) {
      return NextResponse.json(
        { error: "Error creating invoice 2 item 2", details: invoice2Item2Error },
        { status: 500 },
      )
    }

    const { error: invoice2Item3Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice2.id,
      project_id: project2.id,
      description: "Aanleg bedrijfstuin - Arbeid",
      quantity: 50,
      unit_price: 50.0,
      total: 2500.0,
    })

    if (invoice2Item3Error) {
      return NextResponse.json(
        { error: "Error creating invoice 2 item 3", details: invoice2Item3Error },
        { status: 500 },
      )
    }

    // Invoice 3 (Unpaid, recent)
    const invoice3Date = formatDateToISO(randomDate(new Date(2023, 4, 1), new Date(2023, 4, 31)))
    const { data: invoice3, error: invoice3Error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: client3.id,
        invoice_number: "FY2023-05-003",
        invoice_date: invoice3Date,
        total_excl_vat: 12500.0,
        vat_percent: 21,
        vat_amount: 2625.0,
        total_incl_vat: 15125.0,
        is_paid: false,
      })
      .select()
      .single()

    if (invoice3Error) {
      return NextResponse.json({ error: "Error creating invoice 3", details: invoice3Error }, { status: 500 })
    }

    const { error: invoice3Item1Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice3.id,
      project_id: project3.id,
      description: "Renovatie binnenplaats - Fase 1 (Verwijderen oude bestrating)",
      quantity: 1,
      unit_price: 2500.0,
      total: 2500.0,
    })

    if (invoice3Item1Error) {
      return NextResponse.json(
        { error: "Error creating invoice 3 item 1", details: invoice3Item1Error },
        { status: 500 },
      )
    }

    const { error: invoice3Item2Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice3.id,
      project_id: project3.id,
      description: "Renovatie binnenplaats - Fase 2 (Nieuwe bestrating)",
      quantity: 1,
      unit_price: 6000.0,
      total: 6000.0,
    })

    if (invoice3Item2Error) {
      return NextResponse.json(
        { error: "Error creating invoice 3 item 2", details: invoice3Item2Error },
        { status: 500 },
      )
    }

    const { error: invoice3Item3Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice3.id,
      project_id: project3.id,
      description: "Renovatie binnenplaats - Fase 3 (Beplanting)",
      quantity: 1,
      unit_price: 4000.0,
      total: 4000.0,
    })

    if (invoice3Item3Error) {
      return NextResponse.json(
        { error: "Error creating invoice 3 item 3", details: invoice3Item3Error },
        { status: 500 },
      )
    }

    // Invoice 4 (Unpaid, very recent)
    const invoice4Date = formatDateToISO(randomDate(new Date(2023, 5, 1), new Date(2023, 5, 15)))
    const { data: invoice4, error: invoice4Error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        client_id: client1.id,
        invoice_number: "FY2023-06-004",
        invoice_date: invoice4Date,
        total_excl_vat: 5800.0,
        vat_percent: 21,
        vat_amount: 1218.0,
        total_incl_vat: 7018.0,
        is_paid: false,
      })
      .select()
      .single()

    if (invoice4Error) {
      return NextResponse.json({ error: "Error creating invoice 4", details: invoice4Error }, { status: 500 })
    }

    const { error: invoice4Item1Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice4.id,
      project_id: project4.id,
      description: "Seizoensplanting stadsparken - Zomerplanten",
      quantity: 1,
      unit_price: 3800.0,
      total: 3800.0,
    })

    if (invoice4Item1Error) {
      return NextResponse.json(
        { error: "Error creating invoice 4 item 1", details: invoice4Item1Error },
        { status: 500 },
      )
    }

    const { error: invoice4Item2Error } = await supabase.from("invoice_items").insert({
      invoice_id: invoice4.id,
      project_id: project4.id,
      description: "Seizoensplanting stadsparken - Arbeid",
      quantity: 40,
      unit_price: 50.0,
      total: 2000.0,
    })

    if (invoice4Item2Error) {
      return NextResponse.json(
        { error: "Error creating invoice 4 item 2", details: invoice4Item2Error },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: "Sample data created successfully" })
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
