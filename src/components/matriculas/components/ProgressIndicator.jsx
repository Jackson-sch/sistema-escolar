import { CheckCircle, Circle } from "lucide-react"

export default function ProgressIndicator({ progress }) {
  const steps = [
    { name: "Estudiante", threshold: 20 },
    { name: "Nivel Académico", threshold: 40 },
    { name: "Grado", threshold: 60 },
    { name: "Sección", threshold: 80 },
    { name: "Responsable", threshold: 100 },
  ]

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center">
            <div className="flex items-center justify-center">
              {progress >= step.threshold ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
