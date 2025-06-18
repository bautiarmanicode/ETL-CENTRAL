"use client";

import type React from "react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText } from "lucide-react";
import type { LogEntry } from "./types";
import { format } from 'date-fns';

interface LogsTabContentProps {
  logs: LogEntry[];
}

const LogsTabContent: React.FC<LogsTabContentProps> = ({ logs }) => {
  const formatLogMessage = (log: LogEntry) => {
    const timestamp = format(log.timestamp, 'yyyy-MM-dd HH:mm:ss');
    let typeIndicator = "";
    switch(log.type) {
      case "error": typeIndicator = "[ERROR]  "; break;
      case "success": typeIndicator = "[SUCCESS]"; break;
      case "info": 
      default: typeIndicator = "[INFO]   "; break;
    }
    return `${timestamp} ${typeIndicator} ${log.message}`;
  };

  return (
    <div className="space-y-4 p-1">
       <div className="flex items-center text-lg font-medium text-foreground">
        <ScrollText className="mr-2 h-6 w-6 text-primary" />
        <h2 className="font-headline">Registros de Ejecución</h2>
      </div>
      <p className="text-muted-foreground">
        Visualice los registros de las operaciones realizadas en ETL Central. Los logs más recientes aparecen al final.
      </p>
      <Textarea
        value={logs.map(formatLogMessage).join("\n")}
        readOnly
        rows={15}
        className="font-code text-sm bg-muted/30 border-input"
        aria-label="Execution logs"
      />
    </div>
  );
};

export default LogsTabContent;
