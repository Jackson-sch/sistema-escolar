import { getInstituciones } from "@/action/config/institucion-action"
import { getUsuarios } from "@/action/config/usuarios-action"
import { Separator } from "@/components/ui/separator"
import { InstitutionHeader } from "@/components/config/institucion/institucion-header"
import { InstitutionOverview } from "@/components/config/institucion/institucion-overview"
import { InstitutionTabs } from "@/components/config/institucion/institucion-tabs"
import { ErrorCard } from "@/components/config/institucion/error-card"
import { EmptyState } from "@/components/config/institucion/empty-state"
import { LoadingState } from "@/components/config/institucion/loading-state"
import { Suspense } from "react"

export default async function ConfigInstitucionalPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <InstitutionHeader />
      <Separator />

      <Suspense fallback={<LoadingState />}>
        <InstitutionContent />
      </Suspense>
    </div>
  )
}

async function InstitutionContent() {
  const { success, data: instituciones, error } = await getInstituciones()
  const institucion = instituciones?.[0] || null

  if (!success) {
    return <ErrorCard error={error} />
  }

  if (!institucion) {
    return <EmptyState />
  }

  const { data: usuarios = [] } = await getUsuarios(institucion.id, true)
  const director = usuarios.find((user) => user.role === "administrativo" && user.cargo === "director")

  return (
    <div className="space-y-8">
      <InstitutionOverview institucion={institucion} director={director} />
      <InstitutionTabs institucion={institucion} />
    </div>
  )
}
