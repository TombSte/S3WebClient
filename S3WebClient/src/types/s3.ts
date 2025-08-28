export interface S3Connection {
  id: string;
  displayName: string;
  // Environment key (e.g. "dev", "test", "preprod", "prod")
  environment: string;
  endpoint: string;
  region?: string; // Optional for S3-compatible storage like MinIO
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  pathStyle: number; // 1 for true, 0 for false
  isActive: number; // 1 for true, 0 for false
  lastTested?: Date;
  testStatus: "untested" | "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, string>; // Client-side metadata
}

export interface S3ConnectionForm {
  displayName: string;
  // Environment key (e.g. "dev", "test", "preprod", "prod")
  environment: string;
  endpoint: string;
  region?: string; // Optional for S3-compatible storage like MinIO
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  pathStyle: number; // 1 for true, 0 for false
  metadata: Record<string, string>;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  timestamp: Date;
  error?: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  storageClass?: string;
  etag: string;
  versionId?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface S3ObjectEntity {
  id?: number;
  connectionId: string;
  key: string;
  parent: string;
  isFolder: number; // 1 for folder, 0 for file
  size?: number;
  lastModified?: Date;
}

export interface S3Bucket {
  name: string;
  creationDate: Date;
  region: string;
  objectsCount?: number;
  totalSize?: number;
}
