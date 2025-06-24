
"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckSquare, Download, ListChecks, Check, X } from "lucide-react";
import type { ConsolidatedData, DataChunk } from "./types";
import { useToast } from "@/hooks/use-toast";
import { convertToCSV } from "@/lib/etl-logic";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChunkingTabContentProps {
  consolidatedData: ConsolidatedData | null;
  chunkSize: number;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
  generatedChunks: DataChunk[] | null;
  availableColumns: string[];
  selectedColumns: string[];
  onSelectedColumnsChange: (columns: string[]) => void;
}

const ChunkingTabContent: React.FC<ChunkingTabContentProps> = ({
  consolidatedData,
  chunkSize,
  addLog,
  generatedChunks,
  availableColumns,
  selectedColumns,
  onSelectedColumnsChange,
}) => {
  const { toast } = useToast();

  const handleDownloadChunk = (chunkIndex: number, chunkData: DataChunk) => {
    if (!chunkData || chunkData.length === 0) {
      addLog(`Error: El chunk ${chunkIndex + 1} está vacío y no se puede descargar.`, "error");
      toast({
        title: "Chunk Vacío",
        description: `El chunk ${chunkIndex + 1} no contiene datos.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const chunkHeaders = chunkData.length > 0 ? Object.keys(chunkData[0]) : [];
      const csvString = convertToCSV(chunkData, chunkHeaders);
       if (!csvString) {
        addLog(`Error: No se pudo generar el contenido CSV para el chunk ${chunkIndex + 1}.`, "error");
        toast({
          title: "Error de Descarga",
          description: "El chunk está vacío o no se pudo procesar.",
          variant: "destructive",
        });
        return;
      }
      
      const encodedUri = "data:text/csv;charset=utf-8," + "\uFEFF" + encodeURI(csvString);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `chunk_${chunkIndex + 1}.csv`);
      document.body.appendChild(link); 
      link.click();
      document.body.removeChild(link);
      addLog(`Chunk ${chunkIndex + 1} descargado.`, "info");
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la descarga del chunk.";
       addLog(`Error al descargar chunk ${chunkIndex + 1}: ${errorMessage}`, "error");
       toast({
        title: "Error de Descarga",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleColumnSelectionChange = (column: string) => {
    const newSelectedColumns = selectedColumns.includes(column)
      ? selectedColumns.filter(c => c !== column)
      : [...selectedColumns, column];
    onSelectedColumnsChange(newSelectedColumns);
  };

  const handleSelectAll = () => {
    onSelectedColumnsChange(availableColumns);
  };

  const handleDeselectAll = () => {
    onSelectedColumnsChange([]);
  };

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Divida el CSV Madre en chunks. Primero, seleccione las columnas a incluir. Luego, inicie la generación desde la barra lateral.
      </p>

      {!consolidatedData ? (
        <Card className="border-amber-500 bg-amber-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-amber-700">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Datos Consolidados Requeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              Por favor, consolide los datos en la pestaña "Consolidar" antes de configurar y generar chunks.
            </p>
          </CardContent>
        </Card>
      ) : !generatedChunks ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
               <CardTitle className="font-headline flex items-center">
                <ListChecks className="mr-2 h-6 w-6"/>
                Seleccionar Columnas para Chunks
              </CardTitle>
               <CardDescription>
                Elija las columnas que desea incluir en los archivos CSV de los chunks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    <Check className="mr-2 h-4 w-4" /> Seleccionar Todas
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    <X className="mr-2 h-4 w-4" /> Deseleccionar Todas
                  </Button>
              </div>
               <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="space-y-2">
                    {availableColumns.map(col => (
                      <div key={col} className="flex items-center space-x-2">
                        <Checkbox
                          id={`col-${col}`}
                          checked={selectedColumns.includes(col)}
                          onCheckedChange={() => handleColumnSelectionChange(col)}
                        />
                        <Label htmlFor={`col-${col}`} className="font-normal cursor-pointer">{col}</Label>
                      </div>
                    ))}
                  </div>
               </ScrollArea>
                <p className="text-sm text-muted-foreground">{selectedColumns.length} de {availableColumns.length} columnas seleccionadas.</p>
            </CardContent>
          </Card>
          <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center">
              Vista Previa de Chunking
            </CardTitle>
             <CardDescription>
              Ajuste el tamaño del chunk en la barra lateral y luego presione "Generar Chunks".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <Label>Registros en el CSV Madre:</Label>
                <p className="text-2xl font-bold">{consolidatedData.length}</p>
              </div>
              <div>
                <Label>Tamaño de Chunk Configurado:</Label>
                <p className="text-2xl font-bold">{chunkSize}</p>
              </div>
               <div>
                <Label>Chunks a Generar (Aprox.):</Label>
                <p className="text-2xl font-bold">{Math.ceil(consolidatedData.length / chunkSize)}</p>
              </div>
               <div>
                <Label>Columnas a Incluir:</Label>
                <p className="text-2xl font-bold">{selectedColumns.length}</p>
              </div>
          </CardContent>
        </Card>
        </div>
      ) : (
         <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Chunks Generados
            </CardTitle>
             <CardDescription className="text-green-600">
              Se han generado {generatedChunks.length} chunks. Puede descargarlos individualmente.
            </CardDescription>
             <CardDescription className="text-green-600">
              Columnas incluidas: {selectedColumns.join(', ')}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
                <div className="space-y-3 pr-4">
                {generatedChunks.map((chunk, index) => (
                    <div key={index} className="p-3 border rounded-md bg-background flex justify-between items-center">
                    <div>
                        <p className="font-medium">Chunk {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{chunk.length} registros</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadChunk(index, chunk)}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                    </Button>
                    </div>
                ))}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChunkingTabContent;

