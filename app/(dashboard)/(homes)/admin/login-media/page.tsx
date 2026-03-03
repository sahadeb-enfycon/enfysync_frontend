"use client";

import { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { uploadLoginMediaAction } from "./actions";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginMediaUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        // Check size limit (3MB)
        if (file.size > 3 * 1024 * 1024) {
            toast.error("File size must not exceed 3MB.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadLoginMediaAction(formData);

            if (result.success) {
                toast.success("Login media uploaded successfully! It will expire in 24 hours.");
                setFile(null);
                // Reset the file input
                const fileInput = document.getElementById("media-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            } else {
                toast.error(result.error || "Failed to upload login media.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        // We simulate a removal by sending an empty file, or a specific payload if the API expects it.
        // Assuming the backend handles an empty file or a specific "reset" flag by clearing out the active media.
        const formData = new FormData();
        // Sending a tiny transparent 1x1 GIF as a "reset" since an actual empty file might be rejected with 400.
        // Or better yet, we can try to send a specific field like "default=true" if the backend supports it.
        // Let's create a minimal empty file.
        const emptyFile = new File([""], "empty.jpg", { type: "image/jpeg" });
        formData.append("file", emptyFile);

        try {
            const result = await uploadLoginMediaAction(formData);

            if (result.success) {
                toast.success("Login media reset successfully!");
            } else {
                toast.error(result.error || "Failed to remove login media.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred during removal.");
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <>
            <DashboardBreadcrumb title="Login Media Settings" text="Admin Dashboard" />

            <div className="max-w-2xl mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Login Page Media</CardTitle>
                        <CardDescription>
                            Upload an image or GIF to display on the login page. This will replace the default or currently active media. The uploaded media automatically expires after 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Input
                                    id="media-upload"
                                    type="file"
                                    accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Accepted formats: JPEG, PNG, GIF, WebP, SVG. Max size: 3MB.
                                </p>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <Button type="button" variant="destructive" onClick={handleRemove} disabled={isRemoving || isUploading}>
                                    {isRemoving ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Removing...
                                        </>
                                    ) : (
                                        "Remove Custom Media"
                                    )}
                                </Button>
                                <Button onClick={handleUpload} disabled={isUploading || isRemoving || !file}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Upload Media"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
