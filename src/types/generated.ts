export interface GeneratedFile {
  filename: string;
  language: string;
  content: string;
  description?: string;
}

export interface GeneratedImage {
  url: string;
  alt: string;
  description: string;
}

export interface GeneratedProject {
  files: GeneratedFile[];
  images?: GeneratedImage[];
  llmIntegration?: {
    provider: string;
    model: string;
    apiEndpoint: string;
    sampleCode: string;
  };
  databaseSchema?: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        constraints?: string;
      }>;
    }>;
    sql: string;
  };
  apiEndpoints?: Array<{
    method: string;
    path: string;
    description: string;
    requestBody?: string;
    responseBody?: string;
  }>;
}
