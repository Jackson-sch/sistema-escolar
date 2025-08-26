import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, MapPin, GraduationCap, FileText } from "lucide-react"
import { InstitucionForm } from "./form/institucion-form"

export function InstitutionTabs({ institucion }) {
  const tabs = [
    {
      value: "general",
      label: "General",
      icon: <Building className="h-4 w-4" />,
      title: "Información General",
      description: "Actualiza la información básica de tu institución educativa",
    },
    {
      value: "contacto",
      label: "Contacto",
      icon: <MapPin className="h-4 w-4" />,
      title: "Información de Contacto",
      description: "Actualiza los datos de contacto y ubicación de tu institución",
    },
    {
      value: "academico",
      label: "Académico",
      icon: <GraduationCap className="h-4 w-4" />,
      title: "Configuración Académica",
      description: "Gestiona el año escolar, niveles académicos y calendario",
    },
    {
      value: "documentos",
      label: "Documentos",
      icon: <FileText className="h-4 w-4" />,
      title: "Documentos Oficiales",
      description: "Actualiza información sobre resoluciones y documentos legales",
    },
  ]

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8 h-auto p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {tab.icon}
                {tab.title}
              </CardTitle>
              <CardDescription>{tab.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <InstitucionForm institucion={institucion} seccion={tab.value} />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
