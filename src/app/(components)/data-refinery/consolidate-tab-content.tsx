"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseZap, AlertTriangle, CheckSquare } from "lucide-react";
import type { SpiderFile, GosomFile, ConsolidatedData } from "./types";
import { useToast } from "@/hooks/use-toast";

interface ConsolidateTabContentProps {
  spiderFile: SpiderFile | null;
  gosomFile: GosomFile | null;
  consolidatedData: ConsolidatedData | null;
  setConsolidatedData: (data: ConsolidatedData | null) => void;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
}

const ConsolidateTabContent: React.FC<ConsolidateTabContentProps> = ({
  spiderFile,
  gosomFile,
  consolidatedData,
  setConsolidatedData,
  addLog,
}) => {
  const { toast } = useToast();

  const handleConsolidate = () => {
    if (!spiderFile || !gosomFile) {
      addLog("Error: Se requieren archivos de Spider y Gosom para consolidar.", "error");
      toast({
        title: "Archivos Faltantes",
        description: "Por favor, cargue los archivos CSV de Spider y Gosom primero.",
        variant: "destructive",
      });
      return;
    }

    addLog("Iniciando consolidación y deduplicación...", "info");
    // Mock consolidation logic
    // In a real app, parse CSVs, merge, handle conflicts (prioritize Gosom), and deduplicate
    const mockData: ConsolidatedData = [
      { id: "1", nombre: "Empresa Alpha (Gosom)", website: "alpha.com", email: "contact@alpha.com", source: "Gosom", telefono: "123-456-7890", direccion: "N/A" },
      { id: "2", nombre: "Empresa Beta (Spider)", website: "N/A", email: "N/A", source: "Spider", telefono: "987-654-3210", direccion: "Calle Falsa 123" },
      { id: "3", nombre: "Empresa Común", link: "common.com/profile", title: "Empresa Común LLC", website: "common.com", email: "info@common.com", source: "Gosom", telefono: "555-555-5555", direccion: "Av. Siempreviva 742"},
    ];
    
    // Simulate processing delay
    setTimeout(() => {
      setConsolidatedData(mockData);
      addLog(`Consolidación completada. ${mockData.length} registros procesados (simulado).`, "success");
      toast({
        title: "Consolidación Exitosa",
        description: "Los datos han sido consolidados y deduplicados (simulado).",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Una los datos de los CSVs cargados con el CSV Madre (simulado). Se realizará una deduplicación basada en los campos 'link' y 'title' si existen. Los datos de GOSOM tendrán prioridad en caso de conflicto.
      </p>
      
      {!spiderFile || !gosomFile ? (
         <Card className="border-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-amber-700">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Archivos Requeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Por favor, cargue los archivos CSV de Spider y Gosom en la pestaña "Cargar CSVs" antes de continuar con la consolidación.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={handleConsolidate} size="lg" disabled={consolidatedData !== null}>
          <DatabaseZap className="mr-2 h-5 w-5" />
          {consolidatedData ? "Datos Consolidados" : "Consolidar y Deduplicar Datos"}
        </Button>
      )}

      {consolidatedData && (
        <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Datos Consolidados (Simulado)
            </CardTitle>
            <CardDescription className="text-green-600">
              A continuación se muestra una representación simulada de los datos consolidados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-auto rounded-md border bg-background p-3 text-sm">
              <pre>{JSON.stringify(consolidatedData, null, 2)}</pre>
            </div>
            <p className="mt-3 text-sm text-green-700">
              Total de registros consolidados: {consolidatedData.length}. Ya puede proceder a generar chunks si lo desea.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidateTabContent;
