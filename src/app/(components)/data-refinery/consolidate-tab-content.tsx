
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import type { SpiderFile, GosomFile, ConsolidatedData } from "./types";
import etlParams from "../../../../config/etl_params.json";

interface ConsolidateTabContentProps {
  spiderFile: SpiderFile | null;
  gosomFile: GosomFile | null;
  consolidatedData: ConsolidatedData | null;
  addLog: (message: string, type?: "info" | "error" | "success") => void;
}

const ConsolidateTabContent: React.FC<ConsolidateTabContentProps> = ({
  spiderFile,
  gosomFile,
  consolidatedData,
  addLog,
}) => {

  const columns = React.useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!consolidatedData || consolidatedData.length === 0) {
      return [];
    }
    const firstItem = consolidatedData[0];
    return Object.keys(firstItem).map(key => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      cell: ({ getValue }) => {
        const value = getValue() as any;
        return typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);
      },
    }));
  }, [consolidatedData]);

  const table = useReactTable({
    data: consolidatedData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { getHeaderGroups, getRowModel } = table;

  return (
    <div className="space-y-6 p-1">
      <p className="text-muted-foreground">
        Una los datos de los CSVs cargados. Inicie el proceso desde el botón "Consolidar Datos" en la barra lateral. La deduplicación se basará en los campos definidos en `etl_params.json` ({etlParams.deduplication_keys.join(', ')}). Los datos de {etlParams.conflict_resolution_priority_source} tendrán prioridad en caso de conflicto.
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
        !consolidatedData && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center">
                    Listo para Consolidar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                    Los archivos de Spider y Gosom están cargados y validados. Haga clic en el botón <strong>Consolidar Datos</strong> en la barra lateral para comenzar el proceso.
                    </p>
                </CardContent>
            </Card>
        )
      )}

      {consolidatedData && (
        <Card className="mt-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center text-green-700">
              <CheckSquare className="mr-2 h-6 w-6" />
              Datos Consolidados
            </CardTitle>
            <CardDescription className="text-green-600">
              A continuación se muestra una vista previa de los datos consolidados. Puede descargar el archivo CSV completo desde la barra lateral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mt-2 text-sm text-green-700">
              Total de registros consolidados: {consolidatedData.length}.
            </p>
            {spiderFile?.parsedData && (
              <p className="mt-1 text-sm text-green-700">
                Registros cargados de Spider: {spiderFile.parsedData.length}.
              </p>
            )}
            {gosomFile?.parsedData && (
              <p className="mt-1 text-sm text-green-700">
                Registros cargados de Gosom: {gosomFile.parsedData.length}.
              </p>
            )}
            <p className="mt-1 text-sm text-green-700">
              Duplicados eliminados: {((spiderFile?.parsedData?.length || 0) + (gosomFile?.parsedData?.length || 0)) - consolidatedData.length}.
            </p>
            
            <div className="mt-4 max-h-60 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  {getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="sticky top-0 bg-background">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {getRowModel().rows.slice(0, 10).map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-xs">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="p-2 text-xs text-muted-foreground">Previsualización de los primeros {Math.min(10, consolidatedData.length)} de {consolidatedData.length} registros.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidateTabContent;
