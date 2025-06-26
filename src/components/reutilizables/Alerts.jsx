import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";

export default function AlertError({ error }) {
  return (
    <Alert variant="destructive" className="mb-4 border-l-4 border-red-500">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5  text-red-600 " />
        <div>
          <AlertTitle className="font-semibold">¡Error!</AlertTitle>
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

// Alerta sobre los campos que son importantes para el registro
export function AlertInfo() {
  return (
    <Alert variant="info" className="mb-4 border-blue-500/40">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <div>
          <AlertDescription className="text-xs text-muted-foreground">
            Los campos marcados con <span className="text-red-500">*</span> son
            obligatorios.
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
