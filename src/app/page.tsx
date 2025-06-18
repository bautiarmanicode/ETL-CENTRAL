
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { FileUp, DatabaseZap, Orbit, FileText, Settings2, Bot } from "lucide-react";

import UploadTabContent from "./(components)/data-refinery/upload-tab-content";
import ConsolidateTabContent from "./(components)/data-refinery/consolidate-tab-content";
import ChunkingTabContent from "./(components)/data-refinery/chunking-tab-content";
import LogsTabContent from "./(components)/data-refinery/logs-tab-content";
import type { SpiderFile, GosomFile, LogEntry, ConsolidatedData } from "./(components)/data-refinery/types";
import { useToast } from "@/hooks/use-toast";

export default function DataRefineryPage() {
  const [spiderFile, setSpiderFile] = useState<SpiderFile | null>(null);
  const [gosomFile, setGosomFile] = useState<GosomFile | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(50);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const addLog = (message: string, type: "info" | "error" | "success" = "info") => {
    setLogs((prevLogs) => [...prevLogs, { timestamp: new Date(), message, type }]);
  };

  const handleChunkSizeChange = (newSize: number) => {
    if (isNaN(newSize) || newSize < 10) {
        setChunkSize(10);
        addLog("Tamaño de chunk inválido, establecido a 10.", "error");
        toast({title: "Valor Inválido", description: "El tamaño mínimo del chunk es 10.", variant: "destructive"});
    } else if (newSize > 500) {
        setChunkSize(500);
        addLog("Tamaño de chunk inválido, establecido a 500.", "error");
        toast({title: "Valor Inválido", description: "El tamaño máximo del chunk es 500.", variant: "destructive"});
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
    if (newFile === null && oldFile !== null) { // File removed
      changed = true;
    } else if (newFile && (!oldFile || newFile.name !== oldFile.name || newFile.size !== oldFile.size || newFile.lastModified !== oldFile.lastModified)) {
      // New file uploaded or different file selected
      changed = true;
    }

    if (changed && consolidatedData !== null) {
      setConsolidatedData(null);
      addLog("Archivo Spider modificado/eliminado. Datos consolidados y chunks reiniciados.", "info");
    }
  };

  const handleGosomFileChange = (newFile: GosomFile | null) => {
    const oldFile = gosomFile;
    setGosomFile(newFile);
    
    let changed = false;
    if (newFile === null && oldFile !== null) { // File removed
      changed = true;
    } else if (newFile && (!oldFile || newFile.name !== oldFile.name || newFile.size !== oldFile.size || newFile.lastModified !== oldFile.lastModified)) {
      // New file uploaded or different file selected
      changed = true;
    }

    if (changed && consolidatedData !== null) {
      setConsolidatedData(null);
      addLog("Archivo Gosom modificado/eliminado. Datos consolidados y chunks reiniciados.", "info");
    }
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
                  min={10}
                  max={500}
                  className="w-full"
                  aria-label="Tamaño de Chunk"
                />
                <p className="text-xs text-muted-foreground">Min: 10, Max: 500. Valor por defecto: 50.</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
            <div className="flex items-center">
                 <SidebarTrigger className="md:hidden mr-2" />
                 <h2 className="font-headline text-xl font-semibold">ETL Central</h2>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">Consolide, deduplique y divida sus datos CSV con facilidad.</p>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                <FileUp className="mr-1 sm:mr-2 h-4 w-4" /> Cargar CSVs
              </TabsTrigger>
              <TabsTrigger value="consolidate" className="text-xs sm:text-sm">
                <DatabaseZap className="mr-1 sm:mr-2 h-4 w-4" /> Consolidar
              </TabsTrigger>
              <TabsTrigger value="chunking" className="text-xs sm:text-sm">
                <Orbit className="mr-1 sm:mr-2 h-4 w-4" /> Chunkear
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs sm:text-sm">
                <FileText className="mr-1 sm:mr-2 h-4 w-4" /> Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <UploadTabContent
                onSpiderFileChange={handleSpiderFileChange}
                onGosomFileChange={handleGosomFileChange}
                spiderFile={spiderFile}
                gosomFile={gosomFile}
                addLog={addLog}
              />
            </TabsContent>
            <TabsContent value="consolidate">
              <ConsolidateTabContent
                spiderFile={spiderFile}
                gosomFile={gosomFile}
                consolidatedData={consolidatedData}
                setConsolidatedData={setConsolidatedData}
                addLog={addLog}
              />
            </TabsContent>
            <TabsContent value="chunking">
              <ChunkingTabContent
                consolidatedData={consolidatedData}
                chunkSize={chunkSize}
                onChunkSizeChange={handleChunkSizeChange}
                addLog={addLog}
              />
            </TabsContent>
            <TabsContent value="logs">
              <LogsTabContent logs={logs} />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
