"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Globe } from "lucide-react"
import { City } from "country-state-city"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface LocationSelectProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
}

export function LocationSelect({ value, onChange, placeholder = "Select location..." }: LocationSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Memoize the city data for USA and add Remote option
    const allLocations = React.useMemo(() => {
        const usaCities = City.getCitiesOfCountry("US") || []
        const mappedCities = usaCities.map(city => ({
            value: `${city.name.toLowerCase()}-${city.stateCode.toLowerCase()}`,
            label: `${city.name}, ${city.stateCode}`,
            type: "city"
        }))

        return [
            { value: "remote", label: "Remote", type: "remote" },
            ...mappedCities
        ]
    }, [])

    // Optimized filtering: only render matched results up to a certain limit
    const filteredLocations = React.useMemo(() => {
        if (!searchQuery) return allLocations.slice(0, 50)

        const search = searchQuery.toLowerCase()
        const matches = []

        for (const loc of allLocations) {
            if (loc.label.toLowerCase().includes(search)) {
                matches.push(loc)
            }
            if (matches.length >= 100) break // Limit result set for performance
        }

        return matches
    }, [allLocations, searchQuery])

    const selectedLabel = React.useMemo(() => {
        if (!value) return null
        if (value === "remote") return "Remote"
        const found = allLocations.find(l => l.value === value)
        return found ? found.label : value
    }, [allLocations, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12 px-5 border-neutral-300 dark:border-slate-500 rounded-lg hover:bg-transparent font-normal text-base"
                >
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                        {value ? (
                            <>
                                {value === "remote" ? (
                                    <Globe className="h-4 w-4 shrink-0 text-primary" />
                                ) : (
                                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                )}
                                <span className="truncate">
                                    {selectedLabel}
                                </span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search city or type 'Remote'..."
                        onValueChange={setSearchQuery}
                    />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty className="p-0">
                            <div
                                className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
                                onClick={() => {
                                    onChange(searchQuery)
                                    setOpen(false)
                                    setSearchQuery("")
                                }}
                            >
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Use "{searchQuery}" as custom location</span>
                            </div>
                        </CommandEmpty>
                        <CommandGroup heading="Options">
                            {searchQuery && !filteredLocations.some(l => l.label.toLowerCase() === searchQuery.toLowerCase()) && (
                                <CommandItem
                                    value={searchQuery}
                                    onSelect={() => {
                                        onChange(searchQuery)
                                        setOpen(false)
                                        setSearchQuery("")
                                    }}
                                    className="flex items-center gap-2 py-3 px-4 cursor-pointer font-medium text-primary"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span> "{searchQuery}"</span>
                                </CommandItem>
                            )}
                            {filteredLocations.map((loc) => (
                                <CommandItem
                                    key={loc.value}
                                    value={loc.label}
                                    onSelect={() => {
                                        onChange(loc.value === value ? "" : loc.value)
                                        setOpen(false)
                                        setSearchQuery("")
                                    }}
                                    className="flex items-center gap-2 py-3 px-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {loc.type === "remote" ? (
                                            <Globe className="h-4 w-4 text-primary" />
                                        ) : (
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{loc.label}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            value === loc.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
