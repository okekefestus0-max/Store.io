"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PluginSlotName, SitePlugin } from "@/lib/types";

const Ctx = createContext<SitePlugin[]>([]);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [plugins, setPlugins] = useState<SitePlugin[]>([]);
  useEffect(() => {
    fetch("/api/plugins", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const list: SitePlugin[] = d.plugins || [];
        setPlugins(list);
        list.filter((p) => p.enabled && p.kind === "script" && p.scriptSrc).forEach((p) => {
          if (document.querySelector(`script[data-plugin="${p.id}"]`)) return;
          const script = document.createElement("script");
          script.src = p.scriptSrc as string;
          script.async = true;
          script.dataset.plugin = p.id;
          document.body.appendChild(script);
        });
      })
      .catch(() => undefined);
  }, []);
  return <Ctx.Provider value={plugins}>{children}</Ctx.Provider>;
}

export function PluginSlot({ name }: { name: PluginSlotName }) {
  const plugins = useContext(Ctx).filter((p) => p.enabled && p.slots?.includes(name) && p.kind !== "webhook" && p.kind !== "script");
  if (!plugins.length) return null;
  return (
    <div className={`plugin-slot plugin-${name}`}>
      {plugins.map((p) => {
        if (p.kind === "link" && p.href) return <a key={p.id} className="plugin-link" href={p.href}>{p.label || p.name}</a>;
        if (p.kind === "html" && p.html) return <div key={p.id} className="plugin-html" dangerouslySetInnerHTML={{ __html: p.html }} />;
        return null;
      })}
    </div>
  );
}
