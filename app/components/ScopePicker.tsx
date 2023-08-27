"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/@/lib/utils";
// // @ts-expect-error
// import score from "command-score";
import { Button } from "~/@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@/components/ui/popover";

type ScopeOptions = {
  id: string;
  label: string;
};

type ScopePickerProps = {
  scopes: ScopeOptions[];
  value: string;
  setValue: (value: string) => void;
};

export function ScopePicker({
  scopes,
  value = "",
  setValue,
}: ScopePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  //   const filterResults = (value: string, search: string) => {
  //     console.log("filter", value, search);
  //     if (value.startsWith("create scope")) {
  //       const query = search?.trim();
  //       const exactMatch = scopes.find(
  //         (scope) => scope.id === query || scope.label.toLowerCase() === query
  //       );
  //       if (!query) return 0;
  //       if (exactMatch) return 0;
  //       return 1;
  //     }

  //     return score(value, search);
  //   };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
        >
          {value
            ? scopes.find((scope) => scope.id === value)?.label
            : "Select scope..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="Search scopes..."
            onKeyUp={(key) => {
              console.log("key", key);
            }}
          />
          <CommandEmpty>Scope not found.</CommandEmpty>
          <CommandGroup>
            {scopes.map((scope) => (
              <CommandItem
                key={scope.id}
                onSelect={() => {
                  setValue(scope.id === value ? "" : scope.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === scope.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {scope.label}
              </CommandItem>
            ))}
            {/* <CommandItem
              key="__new_scope__"
              onSelect={() => {
                //setValue(scope.id === value ? "" : scope.id);
                setOpen(false);
              }}
            >
              <UserPlus className={cn("mr-2 h-4 w-4")} />
              Create scope&nbsp;
              <span className="bold">{inputValue}</span>
            </CommandItem> */}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
