"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CopyVariantButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copié dans le presse-papier" })
  }

  return (
    <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs" onClick={copy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copié" : "Copier"}
    </Button>
  )
}
