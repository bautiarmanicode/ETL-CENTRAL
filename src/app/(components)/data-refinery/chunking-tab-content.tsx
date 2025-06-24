
"use client";

import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckSquare, Download } from "lucide-react";
import type { ConsolidatedData, DataChunk } from "./types";
import { useToast } from "@/hooks/use-toast";
import { convertToCSV } from "@/lib/etl-logic";

interface ChunkingTabContentProps {
  consolidatedData: ConsolidatedData | null;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
  generatedChunks: DataChunk[] | null;
  selectedColumns: string[];
}

const ChunkingTabContent: React.FC<ChunkingTabContentProps> = ({
  consolidatedData,
  chunkSize,
  onChunkSizeChange,
  addLog,
  generatedChunks,
  selectedColumns,
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
      // The columns to include are the ones selected during generation.
      // The chunk data already contains only these columns plus the chunk metadata.
      const csvString = convertToCSV(chunkData, [...selectedColumns, 'id_chunk_process', 'fecha_chunk_process']);
      if (!csvString) {
        addLog(`Error: No se pudo generar el contenido CSV para el chunk ${chunkIndex + 1}.`, "error");
        toast({
          title: "Error de Descarga",
          description: "El chunk está vacío o no se pudo procesar.",
          variant: "destructive",
        });
        return;
      }
      
      const encodedUri = "data:text/csv;charset=utf-8," + encodeURI(csvString);
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

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Divida el CSV Madre consolidado en chunks más pequeños. Puede iniciar la generación desde la barra lateral una vez que los datos estén consolidados.
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
              Por favor, consolide los datos en la pestaña "Consolidar y Deduplicar" antes de generar chunks.
            </p>
          </CardContent>
        </Card>
      ) : !generatedChunks ? (
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
                <Label htmlFor="chunk-size-tab">Registros en el CSV Madre:</Label>
                <p className="text-2xl font-bold">{consolidatedData.length}</p>
              </div>
              <div>
                <Label htmlFor="chunk-size-tab">Tamaño de Chunk Configurado:</Label>
                <p className="text-2xl font-bold">{chunkSize}</p>
              </div>
               <div>
                <Label htmlFor="chunk-size-tab">Chunks a Generar:</Label>
                <p className="text-2xl font-bold">{Math.ceil(consolidatedData.length / chunkSize)}</p>
              </div>
          </CardContent>
        </Card>
      ) : (
         <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Chunks Generados
            </CardTitle>
             <CardDescription className="text-green-600">
              Total de registros consolidados: {consolidatedData?.length || 0}.
             </CardDescription>
             <CardDescription className="text-green-600">
                Total de registros en chunks: {generatedChunks.reduce((sum, chunk) => sum + chunk.length, 0)}.
             </CardDescription>
             <CardDescription className="text-green-600">
              Se han generado {generatedChunks.length} chunks. Puede descargarlos individualmente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto space-y-3">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChunkingTabContent;
