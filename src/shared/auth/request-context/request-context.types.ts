export type RequestContext = {
  requestId: string;
  traceId?: string;
  userId?: string;
  roles?: string[];
};
