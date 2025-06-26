"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

const FormDatePicker = ({ form, name, label, description }) => {
  const [month, setMonth] = useState(new Date());

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Generate array of years (from 1950 to the current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1950 + 1 },
    (_, i) => 1950 + i
  );

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1.5">
          <FormLabel className="font-medium text-sm flex items-center">
            {label}
            {description ? (
              <span className="text-muted-foreground italic text-xs ml-1">
                {description}
              </span>
            ) : (
              <span className="text-red-500 ml-1">*</span>
            )}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP", {
                      locale: es,
                    })
                  ) : (
                    <span>Seleccione una fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between space-x-2">
                  <Select
                    value={month.getMonth().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(month);
                      newDate.setMonth(parseInt(value));
                      handleMonthChange(newDate);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>{monthNames[month.getMonth()]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-48">
                        {monthNames.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <Select
                    value={month.getFullYear().toString()}
                    onValueChange={handleYearSelect}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue>{month.getFullYear()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-48">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                month={month}
                onMonthChange={handleMonthChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1950-01-01")
                }
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormDatePicker;