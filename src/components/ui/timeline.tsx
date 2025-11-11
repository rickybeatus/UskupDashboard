import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

interface TimelineItemProps {
  children: React.ReactNode
  className?: string
}

interface TimelineContentProps {
  children: React.ReactNode
  className?: string
}

interface TimelineDotProps {
  children: React.ReactNode
  className?: string
}

interface TimelineHeaderProps {
  children: React.ReactNode
  className?: string
}

interface TimelineTitleProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  )
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return (
    <div className={cn("relative flex items-start space-x-4 pb-8", className)}>
      {children}
    </div>
  )
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div className={cn("flex-1 space-y-2", className)}>
      {children}
    </div>
  )
}

export function TimelineDot({ children, className }: TimelineDotProps) {
  return (
    <div className={cn(
      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground",
      className
    )}>
      {children}
    </div>
  )
}

export function TimelineHeader({ children, className }: TimelineHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
    </div>
  )
}

export function TimelineTitle({ children, className }: TimelineTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)}>
      {children}
    </h3>
  )
}