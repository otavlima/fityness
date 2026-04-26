import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Separator } from './ui/separator'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: React.ReactElement<{ size?: number }>
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal = ({ open, onOpenChange, icon, title, description, children, footer }: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-border bg-card text-card-foreground sm:rounded-2xl shadow-none">
        <div className="px-6 pt-6 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            {icon && (
              <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-primary-foreground">
                {React.cloneElement(icon, { size: 20 })}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
              {description && <DialogDescription className="text-muted-foreground text-sm">{description}</DialogDescription>}
            </div>
          </div>
        </div>
        <Separator />
        <div className="px-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="p-4 flex justify-end items-center gap-3 bg-muted/20 border-t">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}