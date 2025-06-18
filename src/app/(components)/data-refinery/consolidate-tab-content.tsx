
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseZap, AlertTriangle, CheckSquare, Download } from "lucide-react";
import type { SpiderFile, GosomFile, ConsolidatedData } from "./types";
import { useToast } from "@/hooks/use-toast";
import { consolidateAndDeduplicate, convertToCSV } from "@/lib/etl-logic";
import etlParams from "../../../../config/etl_params.json";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConsolidate = () => {
    if (!spiderFile || !spiderFile.parsedData || !gosomFile || !gosomFile.parsedData) {
      addLog("Error: Se requieren datos parseados de Spider y Gosom para consolidar.", "error");
      toast({
        title: "Archivos o Datos Faltantes",
        description: "Por favor, cargue y valide los archivos CSV de Spider y Gosom primero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    addLog("Iniciando consolidación y deduplicación real...", "info");
    
    // Simulate processing delay for user feedback
    setTimeout(() => {
      try {
        const result = consolidateAndDeduplicate(
          spiderFile.parsedData!,
          gosomFile.parsedData!,
          etlParams.deduplication_keys,
          etlParams.conflict_resolution_priority_source
        );
        setConsolidatedData(result);
        addLog(`Consolidación completada. ${result.length} registros procesados.`, "success");
        toast({
          title: "Consolidación Exitosa",
          description: `Los datos han sido consolidados y deduplicados. ${result.length} registros resultantes.`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la consolidación.";
        addLog(`Error durante la consolidación: ${errorMessage}`, "error");
        toast({
          title: "Error de Consolidación",
          description: errorMessage,
          variant: "destructive",
        });
        setConsolidatedData(null);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Short delay to allow UI update for loading state
  };

  const handleDownloadConsolidated = () => {
    if (!consolidatedData || consolidatedData.length === 0) {
      addLog("Error: No hay datos consolidados para descargar.", "error");
      toast({
        title: "Sin Datos para Descargar",
        description: "No hay datos consolidados disponibles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvString = convertToCSV(consolidatedData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "consolidated_mother_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog("CSV Madre consolidado descargado.", "success");
      toast({
        title: "Descarga Iniciada",
        description: "El archivo CSV Madre consolidado ha comenzado a descargarse.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la preparación de la descarga.";
      addLog(`Error al descargar CSV consolidado: ${errorMessage}`, "error");
      toast({
        title: "Error de Descarga",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Una los datos de los CSVs cargados. Se realizará una deduplicación basada en los campos definidos en `etl_params.json` ({etlParams.deduplication_keys.join(', ')}). Los datos de {etlParams.conflict_resolution_priority_source} tendrán prioridad en caso de conflicto.
      </p>
      
      {!spiderFile || !gosomFile || !spiderFile.parsedData || !gosomFile.parsedData ? (
         <Card className="border-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-amber-700">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Archivos Válidos Requeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Por favor, cargue y asegúrese de que los archivos CSV de Spider y Gosom hayan sido validados correctamente en la pestaña "Cargar CSVs" antes de consolidar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={handleConsolidate} size="lg" disabled={isLoading || consolidatedData !== null}>
          <DatabaseZap className="mr-2 h-5 w-5" />
          {isLoading ? "Procesando..." : (consolidatedData ? "Datos Consolidados" : "Consolidar y Deduplicar Datos")}
        </Button>
      )}

      {consolidatedData && (
        <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Datos Consolidados
            </CardTitle>
            <CardDescription className="text-green-600">
              A continuación se muestra una vista previa de los datos consolidados. Puede descargar el archivo CSV completo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-auto rounded-md border bg-background p-3 text-sm font-mono">
              <pre>{JSON.stringify(consolidatedData.slice(0, 10), null, 2)}</pre>
              {consolidatedData.length > 10 && <p className="mt-2 text-xs text-muted-foreground">Mostrando los primeros 10 de {consolidatedData.length} registros...</p>}
            </div>
            <p className="mt-3 text-sm text-green-700">
              Total de registros consolidados: {consolidatedData.length}.
            </p>
            <Button onClick={handleDownloadConsolidated} className="mt-4">
              <Download className="mr-2 h-4 w-4" />
              Descargar CSV Madre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidateTabContent;

