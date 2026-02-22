'use client'
import { useSidebar } from '@/components/ui/sidebar'

export function useSidebarCollapsed(): boolean {
    const { state } = useSidebar()
    return state === 'collapsed'
}