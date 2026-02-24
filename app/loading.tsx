import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="p-6 text-center h-full w-full flex justify-center items-center gap-2 min-h-[50vh]">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
            <span className="text-xl font-semibold text-neutral-600">Loading....</span>
        </div>
    )
}
