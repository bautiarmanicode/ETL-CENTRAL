
"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { FileUp, CheckCircle, AlertCircle, FileText, Columns, Rows } from "lucide-react";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import type { SpiderFile, GosomFile } from "./types";
import { useToast } from "@/hooks/use-toast";
import { parse, type ParseResult } from 'papaparse';
import etlParams from "../../../../config/etl_params.json";

interface UploadTabContentProps {
  onSpiderFileChange: (file: SpiderFile | null) => void;
  onGosomFileChange: (file: GosomFile | null) => void;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
  spiderFile: SpiderFile | null;
  gosomFile: GosomFile | null;
}

const UploadTabContent: React.FC<UploadTabContentProps> = ({
  onSpiderFileChange,
  onGosomFileChange,
  addLog,
  spiderFile,
  gosomFile,
}) => {
  const [spiderError, setSpiderError] = useState<string | null>(null);
  const [gosomError, setGosomError] = useState<string | null>(null);
  const [isSpiderLoading, setIsSpiderLoading] = useState(false);
  const [isGosomLoading, setIsGosomLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "spider" | "gosom"
  ) => {
    const file = event.target.files?.[0] || null;
    const onFileChangeCallback = type === "spider" ? onSpiderFileChange : onGosomFileChange;
    const setError = type === "spider" ? setSpiderError : setGosomError;
    const setIsLoading = type === "spider" ? setIsSpiderLoading : setIsGosomLoading;

    // Reset input if no file is selected or selection is cancelled
    if (!file) {
      onFileChangeCallback(null);
      setError(null);
      // Clear the file input visually
      if (event.target) {
        event.target.value = "";
      }
      return;
    }
    
    setError(null); // Reset error state for current uploader
    setIsLoading(true); // Set loading state

    if (file.type !== "text/csv") {
      const errorMsg = "Archivo no válido. Por favor, suba un archivo CSV.";
      setError(errorMsg);
      onFileChangeCallback(null);
      addLog(errorMsg, "error");
      toast({
        title: "Error de Archivo",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading state on error
      if (event.target) event.target.value = ""; // Clear input on error
      return;

    }

    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<Record<string, string>>) => {
        setIsLoading(false); // Reset loading state on completion
        const parsedData = results.data;
        const headers = results.meta.fields as string[] | undefined;

        if (!headers || headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
          const errorMsg = "El archivo CSV está vacío, no tiene encabezados válidos o su formato es incorrecto.";
          setError(errorMsg);
          onFileChangeCallback(null);
          addLog(errorMsg, "error");
          toast({
            title: "Error de CSV",
            description: errorMsg,
            variant: "destructive",
          });
          if (event.target) event.target.value = ""; 
          return;
        }
        
        if (parsedData.length === 0) {
           const errorMsg = "El archivo CSV no contiene datos (solo encabezados).";
           setError(errorMsg);
           onFileChangeCallback(null);
           addLog(errorMsg, "error");
           toast({
            title: "Archivo Vacío",
            description: errorMsg,
            variant: "destructive",
           });
           if (event.target) event.target.value = "";
           return;
        }


        const requiredFields = type === "spider"
          ? etlParams.upload_validation.spider_required_fields
          : etlParams.upload_validation.gosom_required_fields;

        const missingFields = requiredFields.filter(field => !headers.includes(field));

        if (missingFields.length > 0) {
          const errorMsg = `Faltan las siguientes columnas requeridas en ${file.name}: ${missingFields.join(", ")}.`;
          setError(errorMsg);
          onFileChangeCallback(null);
          addLog(errorMsg, "error");
          toast({
            title: "Error de Validación de CSV",
            description: errorMsg,
            variant: "destructive",
          });
          if (event.target) event.target.value = "";
        } else {
          const fileWithData = Object.assign(file, { parsedData });

          if (type === "spider") {
            onSpiderFileChange(fileWithData as SpiderFile);
          } else {
            onGosomFileChange(fileWithData as GosomFile);
          }
          const successMsg = `CSV de ${type === "spider" ? "Spider" : "Gosom"} (${file.name}) cargado y validado. ${parsedData.length} registros encontrados.`;
          addLog(successMsg, "success");
          toast({
            title: "Archivo Procesado",
            description: `Se cargaron y validaron ${parsedData.length} registros de ${file.name}.`,
          });
        }
      },
      error: (error: Error) => {
        setIsLoading(false); // Reset loading state on error
        const errorMsg = `Error al parsear el archivo CSV ${file.name}: ${error.message}`;
        setError(errorMsg);
        onFileChangeCallback(null);
        addLog(errorMsg, "error");
        toast({
          title: "Error de Parseo",
          description: errorMsg,
          variant: "destructive",
        });
        if (event.target) event.target.value = ""; 
      }
    });
  };

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Suba los archivos CSV crudos desde las fuentes Spider y GOSOM. Los archivos serán validados al cargarse.
      </p>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <FileUp className="mr-2 h-6 w-6 text-primary" />
              CSV de Spider
            </CardTitle>
            <CardDescription>
              Contiene datos de leads de la fuente Spider. Campos esperados: {etlParams.upload_validation.spider_required_fields.join(", ")}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="spider-file">Seleccionar archivo CSV</Label>
            <Input
              id="spider-file"
              key={spiderFile ? 'spider-loaded' : 'spider-empty'} // Add key to allow re-triggering onChange for the same file after an error
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, "spider")}
              className={`cursor-pointer ${isSpiderLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-describedby="spider-file-status"
              disabled={isSpiderLoading}
            />
            {spiderError && (
              <p id="spider-file-status" className="text-sm text-destructive flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {spiderError}
              </p>
            )}
            {isSpiderLoading && (
              <p id="spider-file-status" className="text-sm text-blue-600 flex items-center">
                 Cargando y validando...
              </p>
            )}
            {!spiderError && spiderFile && spiderFile.parsedData && (
              <p id="spider-file-status" className="text-sm text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Cargado: {spiderFile.name} ({spiderFile.parsedData.length} registros)
              </p>
            )}
            {!spiderError && spiderFile && spiderFile.parsedData && spiderFile.parsedData.length > 0 && (
              <div className="mt-4 max-h-[500px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(spiderFile.parsedData[0] || {}).map((header) => (
                        <TableHead key={header} className="sticky top-0 bg-background">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spiderFile.parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cellValue, cellIndex) => (
                          <TableCell key={cellIndex} className="text-xs">{cellValue}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="p-2 text-xs text-muted-foreground">Previsualización de los primeros {Math.min(5, spiderFile.parsedData.length)} de {spiderFile.parsedData.length} registros.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <FileUp className="mr-2 h-6 w-6 text-primary" />
              CSV de Gosom
            </CardTitle>
            <CardDescription>
              Contiene datos de leads de la fuente GOSOM. Campos esperados: {etlParams.upload_validation.gosom_required_fields.join(", ")}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="gosom-file">Seleccionar archivo CSV</Label>
            <Input
              id="gosom-file"
              key={gosomFile ? 'gosom-loaded' : 'gosom-empty'} // Add key to allow re-triggering onChange for the same file after an error
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, "gosom")}
              className={`cursor-pointer ${isGosomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-describedby="gosom-file-status"
              disabled={isGosomLoading}
            />
            {gosomError && (
              <p id="gosom-file-status" className="text-sm text-destructive flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {gosomError}
              </p>
            )}
            {isGosomLoading && (
              <p id="gosom-file-status" className="text-sm text-blue-600 flex items-center">
                 Cargando y validando...
              </p>
            )}
            {!gosomError && gosomFile && gosomFile.parsedData &&(
              <p id="gosom-file-status" className="text-sm text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Cargado: {gosomFile.name} ({gosomFile.parsedData.length} registros)
              </p>
            )}
            {!gosomError && gosomFile && gosomFile.parsedData && gosomFile.parsedData.length > 0 && (
              <div className="mt-4 max-h-[500px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(gosomFile.parsedData[0] || {}).map((header) => (
                        <TableHead key={header} className="sticky top-0 bg-background">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gosomFile.parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cellValue, cellIndex) => (
                          <TableCell key={cellIndex} className="text-xs">{cellValue}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="p-2 text-xs text-muted-foreground">Previsualización de los primeros {Math.min(5, gosomFile.parsedData.length)} de {gosomFile.parsedData.length} registros.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {(spiderFile && spiderFile.parsedData && gosomFile && gosomFile.parsedData) && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          <p className="font-medium flex items-center"><CheckCircle className="mr-2 h-5 w-5" /> ¡Archivos cargados y validados!</p>
          <p>Diríjase a la pestaña "Consolidar y Deduplicar" para continuar.</p>
        </div>
      )}
    </div>
  );
};

export default UploadTabContent;
