
"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FileUp, DatabaseZap, Orbit, FileText, Settings2, Bot, Download } from "lucide-react";

import UploadTabContent from "./(components)/data-refinery/upload-tab-content";
import ConsolidateTabContent from "./(components)/data-refinery/consolidate-tab-content";
import ChunkingTabContent from "./(components)/data-refinery/chunking-tab-content";
import LogsTabContent from "./(components)/data-refinery/logs-tab-content";
import type { SpiderFile, GosomFile, LogEntry, ConsolidatedData, DataChunk } from "./(components)/data-refinery/types";
import { useToast } from "@/hooks/use-toast";
import { consolidateAndDeduplicate, generateChunks, convertToCSV } from "@/lib/etl-logic";
import etlParams from "../../config/etl_params.json";
import { Separator } from "@/components/ui/separator";

type ActiveView = 'upload' | 'consolidate' | 'chunking' | 'logs';

export default function DataRefineryPage() {
  const [spiderFile, setSpiderFile] = useState<SpiderFile | null>(null);
  const [gosomFile, setGosomFile] = useState<GosomFile | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(etlParams.chunk_size_default);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const [isLoadingConsolidate, setIsLoadingConsolidate] = useState(false);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [generatedChunks, setGeneratedChunks] = useState<DataChunk[] | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('upload');
  
  const availableColumns = useMemo(() => {
    if (!consolidatedData || consolidatedData.length === 0) return [];
    return Object.keys(consolidatedData[0]).filter(col => col !== 'id' && col !== 'source');
  }, [consolidatedData]);

  useEffect(() => {
    setGeneratedChunks(null);
    if (consolidatedData && consolidatedData.length > 0) {
      setSelectedColumns(Object.keys(consolidatedData[0]).filter(col => col !== 'id' && col !== 'source'));
    } else {
      setSelectedColumns([]);
    }
  }, [consolidatedData]);
  
  useEffect(() => {
    if (!spiderFile || !gosomFile) {
        if (activeView === 'consolidate' || activeView === 'chunking') {
            setActiveView('upload');
        }
    }
    if (!consolidatedData) {
        if (activeView === 'chunking') {
            setActiveView('consolidate');
        }
    }
  }, [spiderFile, gosomFile, consolidatedData, activeView]);

  const addLog = (message: string, type: "info" | "error" | "success" = "info") => {
    setLogs((prevLogs) => [...prevLogs, { timestamp: new Date(), message, type }]);
  };

  const handleChunkSizeChange = (newSize: number) => {
    if (isNaN(newSize) || newSize < etlParams.chunk_size_min) {
        setChunkSize(etlParams.chunk_size_min);
        addLog(`Tamaño de chunk inválido, establecido a ${etlParams.chunk_size_min}.`, "error");
        toast({title: "Valor Inválido", description: `El tamaño mínimo del chunk es ${etlParams.chunk_size_min}.`, variant: "destructive"});
    } else if (newSize > etlParams.chunk_size_max) {
        setChunkSize(etlParams.chunk_size_max);
        addLog(`Tamaño de chunk inválido, establecido a ${etlParams.chunk_size_max}.`, "error");
        toast({title: "Valor Inválido", description: `El tamaño máximo del chunk es ${etlParams.chunk_size_max}.`, variant: "destructive"});
    }
    else {
        setChunkSize(newSize);
        addLog(`Tamaño de chunk actualizado a: ${newSize}`, "info");
    }
  };

  const handleSpiderFileChange = (newFile: SpiderFile | null) => {
    const oldFile = spiderFile;
    setSpiderFile(newFile);

    let changed = false;
    if (newFile === null && oldFile !== null) { 
      changed = true;
    } else if (newFile && (!oldFile || newFile.name !== oldFile.name || newFile.size !== oldFile.size || newFile.lastModified !== oldFile.lastModified)) {
      changed = true;
    }

    if (changed) {
      setConsolidatedData(null);
      addLog("Archivo Spider modificado/eliminado. Datos consolidados y chunks reiniciados.", "info");
    }
  };

  const handleGosomFileChange = (newFile: GosomFile | null) => {
    const oldFile = gosomFile;
    setGosomFile(newFile);
    
    let changed = false;
    if (newFile === null && oldFile !== null) { 
      changed = true;
    } else if (newFile && (!oldFile || newFile.name !== oldFile.name || newFile.size !== oldFile.size || newFile.lastModified !== oldFile.lastModified)) {
      changed = true;
    }

    if (changed) {
      setConsolidatedData(null);
      addLog("Archivo Gosom modificado/eliminado. Datos consolidados y chunks reiniciados.", "info");
    }
  };

  const handleConsolidate = () => {
    if (!spiderFile?.parsedData || !gosomFile?.parsedData) {
      addLog("Error: Se requieren datos parseados de Spider y Gosom para consolidar.", "error");
      toast({
        title: "Archivos o Datos Faltantes",
        description: "Por favor, cargue y valide los archivos CSV de Spider y Gosom primero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingConsolidate(true);
    addLog("Iniciando consolidación y deduplicación...", "info");

    try {
      const result = consolidateAndDeduplicate(
        spiderFile.parsedData,
        gosomFile.parsedData,
        etlParams.deduplication_keys,
        etlParams.conflict_resolution_priority_source,
        etlParams.column_mapping
      );
      setConsolidatedData(result);
      addLog(`Consolidación completada. ${result.length} registros procesados.`, "success");
      toast({
        title: "Consolidación Exitosa",
        description: `Los datos han sido consolidados y deduplicados. ${result.length} registros resultantes.`,
      });
      setActiveView('consolidate');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la consolidación.";
      addLog(`Error durante la consolidación: ${errorMessage}`, "error");
      toast({ title: "Error de Consolidación", description: errorMessage, variant: "destructive" });
      setConsolidatedData(null);
    } finally {
      setIsLoadingConsolidate(false);
    }
  };

  const handleGenerateChunks = () => {
    if (!consolidatedData) {
      addLog("Error: No hay datos consolidados para generar chunks.", "error");
      toast({ title: "Datos Faltantes", description: "Por favor, consolide los datos primero.", variant: "destructive" });
      return;
    }
    if (selectedColumns.length === 0) {
      addLog("Error: Debes seleccionar al menos una columna para incluir en los chunks.", "error");
      toast({ title: "Columnas no Seleccionadas", description: "Por favor, seleccione al menos una columna.", variant: "destructive" });
      return;
    }

    setIsLoadingChunks(true);
    addLog(`Iniciando generación de chunks con tamaño ${chunkSize} y ${selectedColumns.length} columnas...`, "info");
    
    try {
      const chunks = generateChunks(consolidatedData, chunkSize, selectedColumns);
      setGeneratedChunks(chunks);
      addLog(`${chunks.length} chunks generados.`, "success");
      toast({ title: "Chunks Generados", description: `Se han generado ${chunks.length} chunks de datos.` });
      setActiveView('chunking');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió durante la generación de chunks.";
      addLog(`Error al generar chunks: ${errorMessage}`, "error");
      toast({ title: "Error al Generar Chunks", description: errorMessage, variant: "destructive" });
      setGeneratedChunks(null);
    } finally {
      setIsLoadingChunks(false);
    }
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
      const allCols = Object.keys(consolidatedData[0]);
      const csvString = convertToCSV(consolidatedData, allCols);
      const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "consolidated_mother_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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

  const viewTitles: Record<ActiveView, string> = {
    upload: "Cargar CSVs",
    consolidate: "Consolidar y Deduplicar",
    chunking: "Generar Chunks",
    logs: "Registros de Ejecución"
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
             <Bot className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold text-primary">
              Data Refinery
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="flex items-center">
                Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveView('upload')} isActive={activeView === 'upload'} tooltip="Cargar Archivos CSV">
                    <FileUp /> Cargar CSVs
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveView('consolidate')} isActive={activeView === 'consolidate'} disabled={!spiderFile || !gosomFile} tooltip="Consolidar Datos">
                    <DatabaseZap /> Consolidar
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveView('chunking')} isActive={activeView === 'chunking'} disabled={!consolidatedData} tooltip="Generar Chunks">
                    <Orbit /> Chunkear
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveView('logs')} isActive={activeView === 'logs'} tooltip="Ver Registros">
                    <FileText /> Logs
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="p-2">
            <SidebarGroupLabel className="flex items-center">
                <Settings2 className="mr-2"/> Configuración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 p-2">
                <Label htmlFor="chunk-size-sidebar">Tamaño de Chunk</Label>
                <Input
                  id="chunk-size-sidebar"
                  type="number"
                  value={chunkSize}
                  onChange={(e) => handleChunkSizeChange(parseInt(e.target.value, 10))}
                  min={etlParams.chunk_size_min}
                  max={etlParams.chunk_size_max}
                  className="w-full"
                  aria-label="Tamaño de Chunk"
                />
                <p className="text-xs text-muted-foreground">Min: {etlParams.chunk_size_min}, Max: {etlParams.chunk_size_max}.</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="p-2">
             <SidebarGroupLabel className="flex items-center">
                <DatabaseZap className="mr-2"/> Acciones
            </SidebarGroupLabel>
            <SidebarGroupContent className="p-2 space-y-2">
               <Button
                onClick={handleConsolidate}
                className="w-full"
                disabled={!spiderFile || !gosomFile || consolidatedData !== null || isLoadingConsolidate}
              >
                <DatabaseZap className="mr-2 h-5 w-5" />
                {isLoadingConsolidate ? "Procesando..." : (consolidatedData !== null ? "Datos Consolidados" : "Consolidar Datos")}
              </Button>
               <Button
                onClick={handleDownloadConsolidated}
                className="w-full"
                variant="outline"
                disabled={!consolidatedData}
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar CSV Madre
              </Button>
               <Separator className="my-2" />
              <Button
                onClick={handleGenerateChunks}
                className="w-full"
                disabled={!consolidatedData || generatedChunks !== null || isLoadingChunks}
              >
                <Orbit className="mr-2 h-5 w-5" />
                {isLoadingChunks ? "Generando..." : (generatedChunks !== null ? "Chunks Generados" : "Generar Chunks")}
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
            <div className="flex items-center">
                 <SidebarTrigger className="md:hidden mr-2" />
                 <h2 className="font-headline text-xl font-semibold">{viewTitles[activeView]}</h2>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">Consolide, deduplique y divida sus datos CSV con facilidad.</p>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
            {activeView === 'upload' && (
              <UploadTabContent
                onSpiderFileChange={handleSpiderFileChange}
                onGosomFileChange={handleGosomFileChange}
                spiderFile={spiderFile}
                gosomFile={gosomFile}
                addLog={addLog}
              />
            )}
            {activeView === 'consolidate' && (
              <ConsolidateTabContent
                spiderFile={spiderFile}
                gosomFile={gosomFile}
                consolidatedData={consolidatedData}
                addLog={addLog}
              />
            )}
            {activeView === 'chunking' && (
              <ChunkingTabContent
                consolidatedData={consolidatedData}
                chunkSize={chunkSize}
                addLog={addLog}
                generatedChunks={generatedChunks}
                availableColumns={availableColumns}
                selectedColumns={selectedColumns}
                onSelectedColumnsChange={setSelectedColumns}
              />
            )}
            {activeView === 'logs' && <LogsTabContent logs={logs} />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
