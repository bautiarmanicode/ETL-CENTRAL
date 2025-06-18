
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Orbit, AlertTriangle, CheckSquare, Download } from "lucide-react";
import type { ConsolidatedData, DataChunk } from "./types";
import { useToast } from "@/hooks/use-toast";
import { generateChunks, convertToCSV } from "@/lib/etl-logic";

interface ChunkingTabContentProps {
  consolidatedData: ConsolidatedData | null;
  chunkSize: number;
  onChunkSizeChange: (size: number) => void;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
}

const ChunkingTabContent: React.FC<ChunkingTabContentProps> = ({
  consolidatedData,
  chunkSize,
  onChunkSizeChange,
  addLog,
}) => {
  const [generatedChunks, setGeneratedChunks] = useState<DataChunk[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setGeneratedChunks(null);
  }, [consolidatedData]);

  const handleGenerateChunks = () => {
    if (!consolidatedData || consolidatedData.length === 0) {
      addLog("Error: No hay datos consolidados para generar chunks.", "error");
      toast({
        title: "Datos Faltantes",
        description: "Por favor, consolide los datos primero.",
        variant: "destructive",
      });
      return;
    }
    if (chunkSize <= 0) {
      addLog("Error: El tamaño del chunk debe ser mayor que cero.", "error");
       toast({
        title: "Tamaño de Chunk Inválido",
        description: "El tamaño del chunk debe ser un número positivo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    addLog(`Iniciando generación de chunks con tamaño ${chunkSize}...`, "info");
    
    try {
      const chunks = generateChunks(consolidatedData, chunkSize);
      setGeneratedChunks(chunks);
      addLog(`${chunks.length} chunks generados.`, "success");
      toast({
        title: "Chunks Generados",
        description: `Se han generado ${chunks.length} chunks de datos.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la generación de chunks.";
      addLog(`Error al generar chunks: ${errorMessage}`, "error");
      toast({
        title: "Error al Generar Chunks",
        description: errorMessage,
        variant: "destructive",
      });
      setGeneratedChunks(null);
    } finally {
      setIsLoading(false);
    }
  };

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
      const csvString = convertToCSV(chunkData);
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
        Divida el CSV Madre consolidado en chunks más pequeños para facilitar la asignación de leads. Defina el tamaño de cada chunk.
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
      ) : (
        <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center">
              <Orbit className="mr-2 h-6 w-6 text-primary" />
              Configuración de Chunking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chunk-size-tab">Tamaño de Chunk</Label>
              <Input
                id="chunk-size-tab"
                type="number"
                value={chunkSize}
                onChange={(e) => onChunkSizeChange(parseInt(e.target.value, 10))}
                min={10} 
                max={500}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Número de registros por chunk (ej: 50).</p>
            </div>
            <Button onClick={handleGenerateChunks} size="lg" disabled={isLoading || generatedChunks !== null}>
              <Orbit className="mr-2 h-5 w-5" />
              {isLoading ? "Generando..." : (generatedChunks !== null ? "Chunks Generados" : "Generar Chunks")}
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedChunks && (
        <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Chunks Generados
            </CardTitle>
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
