import { GeneratedProject } from "@/types/generated";
import { Database, Server, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IntegrationPanelProps {
  project: GeneratedProject;
}

const IntegrationPanel = ({ project }: IntegrationPanelProps) => {
  const { llmIntegration, databaseSchema, apiEndpoints } = project;

  if (!llmIntegration && !databaseSchema && !apiEndpoints) {
    return null;
  }

  return (
    <div className="border-t border-border/50 bg-popover/30">
      <div className="p-4 space-y-6">
        {/* LLM Integration */}
        {llmIntegration && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">LLM Integration</h3>
            </div>
            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2 font-medium">{llmIntegration.provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <span className="ml-2 font-medium">{llmIntegration.model}</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Endpoint:</span>
                <code className="ml-2 text-primary font-mono bg-secondary/30 px-2 py-0.5 rounded">
                  {llmIntegration.apiEndpoint}
                </code>
              </div>
              {llmIntegration.sampleCode && (
                <div className="mt-3">
                  <span className="text-sm text-muted-foreground">Sample Code:</span>
                  <pre className="mt-2 text-xs font-mono bg-secondary/20 p-3 rounded-lg overflow-x-auto">
                    <code>{llmIntegration.sampleCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Database Schema */}
        {databaseSchema && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-chart-2">
              <Database className="h-5 w-5" />
              <h3 className="font-semibold">Database Schema</h3>
            </div>
            <div className="bg-card/50 rounded-lg p-4 space-y-4">
              {databaseSchema.tables?.map((table, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <span className="text-primary">📊</span>
                    {table.name}
                  </h4>
                  <div className="text-xs font-mono bg-secondary/20 rounded p-2 space-y-1">
                    {table.columns?.map((col, colIndex) => (
                      <div key={colIndex} className="flex gap-2">
                        <span className="text-foreground">{col.name}</span>
                        <span className="text-muted-foreground">{col.type}</span>
                        {col.constraints && (
                          <span className="text-primary/70">{col.constraints}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {databaseSchema.sql && (
                <div className="mt-3">
                  <span className="text-sm text-muted-foreground">SQL:</span>
                  <ScrollArea className="h-[150px] mt-2">
                    <pre className="text-xs font-mono bg-secondary/20 p-3 rounded-lg">
                      <code>{databaseSchema.sql}</code>
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Endpoints */}
        {apiEndpoints && apiEndpoints.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-chart-4">
              <Server className="h-5 w-5" />
              <h3 className="font-semibold">API Endpoints</h3>
            </div>
            <div className="bg-card/50 rounded-lg p-4 space-y-3">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="text-sm space-y-1 pb-3 border-b border-border/30 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                      endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-foreground">{endpoint.path}</code>
                  </div>
                  <p className="text-muted-foreground text-xs">{endpoint.description}</p>
                  {endpoint.requestBody && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Request: </span>
                      <code className="text-primary/80">{endpoint.requestBody}</code>
                    </div>
                  )}
                  {endpoint.responseBody && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Response: </span>
                      <code className="text-chart-2/80">{endpoint.responseBody}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationPanel;
