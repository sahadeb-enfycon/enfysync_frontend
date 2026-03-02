"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ResetPodsButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient("/pods/reset-assignment-cycle", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to reset pods");
            }

            toast.success("All pods have been reset to available status.");

            // Reload the page to reflect any changes if needed, or we can just let it be.
            // Since it's a server component page, a hard reload might be best or router.refresh()
            window.location.reload();

        } catch (error: any) {
            console.error("Error resetting pods:", error);
            toast.error(error.message || "An error occurred while resetting pods");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 px-4 flex items-center gap-2 hover:bg-red-500 hover:text-white cursor-pointer"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? "Resetting..." : "Reset Assignment Cycle"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Reset Job Assignment Cycle?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will manually restart the round-robin job distribution from scratch by setting all pods to "available for assignment".
                        <br /><br />
                        <strong>Note:</strong> This is usually NOT needed as the system auto-resets when all pods are exhausted. Use this only to manually unblock the system if something went wrong.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            handleReset();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Resetting..." : "Yes, Reset Cycle"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
