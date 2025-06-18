"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, CheckCircle, AlertCircle } from "lucide-react";
import type { SpiderFile, GosomFile } from "./types";

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
  const [spiderFileName, setSpiderFileName] = useState<string | null>(null);
  const [gosomFileName, setGosomFileName] = useState<string | null>(null);
  const [spiderError, setSpiderError] = useState<string | null>(null);
  const [gosomError, setGosomError] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "spider" | "gosom"
  ) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type !== "text/csv") {
        const errorMsg = "Archivo no válido. Por favor, suba un archivo CSV.";
        if (type === "spider") {
          setSpiderError(errorMsg);
          onSpiderFileChange(null);
          setSpiderFileName(null);
        } else {
          setGosomError(errorMsg);
          onGosomFileChange(null);
          setGosomFileName(null);
        }
        addLog(errorMsg, "error");
        return;
      }

      // Basic validation mock - in a real app, parse and check headers here
      // Spider: Requiere `nombre`, `dirección`, `teléfono`.
      // Gosom: Requiere `nombre`, `website`, `email`.
      const successMsg = `CSV de ${type === "spider" ? "Spider" : "Gosom"} (${file.name}) cargado y validado (simulado).`;
      if (type === "spider") {
        setSpiderError(null);
        onSpiderFileChange(file as SpiderFile);
        setSpiderFileName(file.name);
      } else {
        setGosomError(null);
        onGosomFileChange(file as GosomFile);
        setGosomFileName(file.name);
      }
      addLog(successMsg, "success");
    } else {
      if (type === "spider") {
        onSpiderFileChange(null);
        setSpiderFileName(null);
      } else {
        onGosomFileChange(null);
        setGosomFileName(null);
      }
    }
  };

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Suba los archivos CSV crudos desde las fuentes Spider y GOSOM. Los archivos serán validados (simulado) al cargarse.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <FileUp className="mr-2 h-6 w-6 text-primary" />
              CSV de Spider
            </CardTitle>
            <CardDescription>
              Contiene datos de leads de la fuente Spider. Campos esperados: nombre, dirección, teléfono.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="spider-file">Seleccionar archivo CSV</Label>
            <Input
              id="spider-file"
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, "spider")}
              className="cursor-pointer"
              aria-describedby="spider-file-status"
            />
            {spiderFileName && !spiderError && (
              <p id="spider-file-status" className="text-sm text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Cargado: {spiderFileName}
              </p>
            )}
            {spiderError && (
              <p id="spider-file-status" className="text-sm text-destructive flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {spiderError}
              </p>
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
              Contiene datos de leads de la fuente GOSOM. Campos esperados: nombre, website, email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="gosom-file">Seleccionar archivo CSV</Label>
            <Input
              id="gosom-file"
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, "gosom")}
              className="cursor-pointer"
              aria-describedby="gosom-file-status"
            />
            {gosomFileName && !gosomError && (
              <p id="gosom-file-status" className="text-sm text-green-600 flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" /> Cargado: {gosomFileName}
              </p>
            )}
            {gosomError && (
              <p id="gosom-file-status" className="text-sm text-destructive flex items-center">
                <AlertCircle className="mr-1 h-4 w-4" /> {gosomError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {(spiderFile && gosomFile) && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          <p className="font-medium flex items-center"><CheckCircle className="mr-2 h-5 w-5" /> ¡Archivos cargados y listos para consolidar!</p>
          <p>Diríjase a la pestaña "Consolidar y Deduplicar" para continuar.</p>
        </div>
      )}
    </div>
  );
};

export default UploadTabContent;
