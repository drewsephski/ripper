"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-2 bg-background rounded text-foreground shadow-md hover:shadow-sm data-[state=open]:shadow-sm transition-all overflow-hidden",
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-start justify-between px-4 py-2 font-head cursor-pointer focus:outline-hidden",
        className,
      )}
      {...props}
    >
      {children}
      <motion.div
        className="h-4 w-4 shrink-0"
        initial={false}
        animate={{ rotate: 0 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180" />
      </motion.div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionHeader.displayName = AccordionPrimitive.Header.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden font-body bg-white text-gray-700"
    {...props}
    asChild
  >
    <motion.div
      initial="collapsed"
      animate="open"
      exit="collapsed"
      variants={{
        open: { opacity: 1, height: "auto" },
        collapsed: { opacity: 0, height: 0 }
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={cn("px-4 pt-2 pb-4", className)}>{children}</div>
    </motion.div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const AccordionComponent = Object.assign(Accordion, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Content: AccordionContent,
});

export { AccordionComponent as Accordion };
