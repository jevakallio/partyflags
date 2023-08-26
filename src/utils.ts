const TRACE_ENABLED = true;

export function trace(...message: any[]): void {
  if (TRACE_ENABLED) {
    console.log(...message);
  }
}
