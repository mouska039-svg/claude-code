"use client"

import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

export function QuotaExceededModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Quota mensuel atteint</DialogTitle>
          <DialogDescription>
            Tu as utilisé toutes tes générations ce mois-ci. Passe au plan Pro ou Premium pour
            continuer à générer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Plus tard
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/dashboard/billing">Upgrader mon plan</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
