export function createScript(src: string, attrs: Record<string, any>) {
  const script = document.createElement("script");
  Object.entries({ src, type: "text/javascript", ...attrs, }).forEach(([key, value]) => {
    if (key.startsWith("data-")) {
      script.setAttribute(key, value as string); // dataset?
    } else {
      (script as any)[key] = value;
    }
  });
  return script;
}
