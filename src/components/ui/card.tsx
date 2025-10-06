import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
<<<<<<< HEAD
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full min-w-0 flex-shrink-1",
=======
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
<<<<<<< HEAD
        "flex flex-col gap-1.5 px-6",
=======
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
<<<<<<< HEAD
        "flex justify-end items-start gap-2",
=======
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
<<<<<<< HEAD
      className={cn("flex items-center px-6 py-4", className)}
=======
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
>>>>>>> b54ed963e42b18f24b0debb1a41952154db626e5
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
