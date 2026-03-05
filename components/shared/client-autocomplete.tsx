"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2, Loader2 } from "lucide-react"

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
import { apiClient } from "@/lib/apiClient"

interface Client {
    id: string
    name: string
}

interface ClientAutocompleteProps {
    type: "CLIENT" | "END_CLIENT"
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    required?: boolean
}

export function ClientAutocomplete({
    type,
    value,
    onChange,
    placeholder = "Select or type client name...",
    required = false
}: ClientAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [clients, setClients] = React.useState<Client[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Debounce the API call
    React.useEffect(() => {
        const fetchClients = async () => {
            setIsLoading(true)
            try {
                const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
                const response = await apiClient(`/clients?type=${type}${searchParam}`)
                if (response.ok) {
                    const data = await response.json()
                    setClients(data)
                }
            } catch (error) {
                console.error(`Failed to fetch ${type} list:`, error)
            } finally {
                setIsLoading(false)
            }
        }

        const timeoutId = setTimeout(() => {
            if (open) {
                fetchClients()
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, open, type])

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue)
        setOpen(false)
        setSearchQuery("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-12 px-5 border-neutral-300 dark:border-slate-500 rounded-lg hover:bg-transparent font-normal text-base",
                        !value && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                        <Building2 className="h-4 w-4 shrink-0 text-primary opacity-70" />
                        <span className="truncate">
                            {value || placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search or type new name..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList className="max-h-[300px]">
                        {isLoading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isLoading && clients.length === 0 && (
                            <CommandEmpty className="p-0">
                                {searchQuery ? (
                                    <div
                                        className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
                                        onClick={() => handleSelect(searchQuery)}
                                    >
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span>Use "{searchQuery}" as new client</span>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Type to search or add a new client.
                                    </div>
                                )}
                            </CommandEmpty>
                        )}
                        <CommandGroup heading="Results">
                            {searchQuery && !clients.some(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
                                <CommandItem
                                    value={searchQuery}
                                    onSelect={() => handleSelect(searchQuery)}
                                    className="flex items-center gap-2 py-3 px-4 cursor-pointer font-medium text-primary"
                                >
                                    <Building2 className="h-4 w-4" />
                                    <span>Create "{searchQuery}"</span>
                                </CommandItem>
                            )}
                            {clients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => handleSelect(client.name)}
                                    className="flex items-center gap-2 py-3 px-4 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span>{client.name}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            value === client.name ? "opacity-100 text-primary" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
            {/* Hidden Input mapping for easy Native HTML Form submissions */}
            {required ? (
                <input type="hidden" name={type === "CLIENT" ? "clientName" : "endClientName"} value={value || ""} required={required} />
            ) : (
                <input type="hidden" name={type === "CLIENT" ? "clientName" : "endClientName"} value={value || ""} />
            )}
        </Popover>
    )
}
