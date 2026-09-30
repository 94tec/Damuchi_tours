"use client";

import {
    CheckCircle2,
    AlertTriangle,
    Info,
    XCircle,
    Loader2,
} from "lucide-react";

import {
    Toaster as SonnerToaster,
    toast as sonnerToast,
} from "sonner";

type ToastOptions = Parameters<typeof sonnerToast>[1];

export function Toaster() {
    return (
        <SonnerToaster
            richColors
            closeButton
            expand
            visibleToasts={5}
            position="top-center"
            theme="system"
            toastOptions={{
                duration: 5000,

                classNames: {
                    toast: `
                        group
                        rounded-2xl
                        border
                        bg-background/95
                        backdrop-blur-xl
                        shadow-xl
                        px-4
                        py-3
                    `,

                    title: `
                        text-sm
                        font-semibold
                    `,

                    description: `
                        mt-1
                        text-sm
                        text-muted-foreground
                    `,

                    closeButton: `
                        bg-transparent
                        border-0
                        text-muted-foreground
                        hover:text-foreground
                    `,

                    actionButton: `
                        rounded-lg
                        text-xs
                        font-medium
                    `,

                    cancelButton: `
                        rounded-lg
                        text-xs
                        font-medium
                    `,
                },
            }}
        />
    );
}

const icons = {
    success: (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    ),

    error: (
        <XCircle className="h-5 w-5 text-red-500" />
    ),

    warning: (
        <AlertTriangle className="h-5 w-5 text-amber-500" />
    ),

    info: (
        <Info className="h-5 w-5 text-blue-500" />
    ),

    loading: (
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
    ),
};

export const toast = {
    success(
        message: string,
        options?: ToastOptions,
    ) {
        return sonnerToast.success(message, {
            icon: icons.success,
            ...options,
        });
    },

    error(
        message: string,
        options?: ToastOptions,
    ) {
        return sonnerToast.error(message, {
            icon: icons.error,
            ...options,
        });
    },

    warning(
        message: string,
        options?: ToastOptions,
    ) {
        return sonnerToast.warning(message, {
            icon: icons.warning,
            ...options,
        });
    },

    info(
        message: string,
        options?: ToastOptions,
    ) {
        return sonnerToast.info(message, {
            icon: icons.info,
            ...options,
        });
    },

    loading(
        message: string,
        options?: ToastOptions,
    ) {
        return sonnerToast.loading(message, {
            icon: icons.loading,
            ...options,
        });
    },

    promise<T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        },
    ) {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    },

    dismiss(id?: string | number) {
        sonnerToast.dismiss(id);
    },

    custom: sonnerToast,
};