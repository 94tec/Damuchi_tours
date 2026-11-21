"use client";

import type { Control, FieldPath } from "react-hook-form";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EnquiryFormValues } from "@/lib/validations/enquiry";

type FieldControl = Control<EnquiryFormValues>;
type FieldName = FieldPath<EnquiryFormValues>;

/* ============================================================
   STYLES
   text-base on phones: anything below 16px makes iOS Safari
   zoom the page when a field is focused.
============================================================ */

const FIELD_BASE =
    "w-full rounded-xl border border-border/70 bg-background/70 text-base shadow-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-coral focus:ring-2 focus:ring-coral/15 sm:text-sm";

const INPUT_CLASS = cn(FIELD_BASE, "h-11 px-3.5");
const SELECT_CLASS = cn(FIELD_BASE, "h-11 appearance-none px-3.5 pr-10");
const TEXTAREA_CLASS = cn(FIELD_BASE, "min-h-[112px] resize-y px-3.5 py-3");

const ICON_CLASS =
    "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50";

/* ============================================================
   SHARED PIECES
============================================================ */

function FieldLabel({
                        children,
                        optional,
                    }: {
    children: React.ReactNode;
    optional?: boolean;
}) {
    return (
        <FormLabel className="text-[13px] font-medium sm:text-xs">
            {children}
            {optional && (
                <span className="ml-1.5 font-normal text-muted-foreground">
                    optional
                </span>
            )}
        </FormLabel>
    );
}

/** Titled group of fields. */
export function FormSection({
                                icon: Icon,
                                title,
                                description,
                                children,
                            }: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-3.5 flex items-center gap-2.5">
                {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}

                <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-tight">{title}</h3>
                    {description && (
                        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3">{children}</div>
        </section>
    );
}

/* ============================================================
   TEXT / EMAIL / TEL / DATE
   FormControl wraps the <input> itself (not a wrapper div), so the
   label, aria-invalid and aria-describedby attach to the real field.
============================================================ */

type NativeInputProps = Pick<
    React.ComponentProps<"input">,
    "inputMode" | "autoComplete" | "autoCapitalize" | "spellCheck" | "min" | "enterKeyHint"
>;

interface TextFieldProps extends NativeInputProps {
    control: FieldControl;
    name: FieldName;
    label: string;
    icon?: LucideIcon;
    optional?: boolean;
    placeholder?: string;
    type?: "text" | "email" | "tel" | "date";
    hint?: React.ReactNode;
}

export function TextField({
                              control,
                              name,
                              label,
                              icon: Icon,
                              optional,
                              placeholder,
                              type = "text",
                              hint,
                              ...inputProps
                          }: TextFieldProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FieldLabel optional={optional}>{label}</FieldLabel>

                    <div className="relative">
                        {Icon && <Icon className={ICON_CLASS} aria-hidden="true" />}

                        <FormControl>
                            <Input
                                {...inputProps}
                                {...field}
                                value={(field.value as string | undefined) ?? ""}
                                type={type}
                                placeholder={placeholder}
                                className={cn(
                                    INPUT_CLASS,
                                    Icon && "pl-10",
                                    // iOS centres date text and ignores height otherwise
                                    type === "date" &&
                                    "appearance-none text-left [&::-webkit-date-and-time-value]:text-left",
                                )}
                            />
                        </FormControl>
                    </div>

                    {hint && (
                        <p className="text-[11px] leading-4 text-muted-foreground">{hint}</p>
                    )}

                    <FormMessage className="text-xs" />
                </FormItem>
            )}
        />
    );
}

/* ============================================================
   SELECT (native: best picker UX on phones)
============================================================ */

export function SelectField({
                                control,
                                name,
                                label,
                                optional,
                                emptyLabel,
                                options,
                            }: {
    control: FieldControl;
    name: FieldName;
    label: string;
    optional?: boolean;
    emptyLabel: string;
    options: { value: string; label: string }[];
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FieldLabel optional={optional}>{label}</FieldLabel>

                    <div className="relative">
                        <FormControl>
                            <select
                                {...field}
                                value={(field.value as string | undefined) ?? ""}
                                className={SELECT_CLASS}
                            >
                                <option value="">{emptyLabel}</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </FormControl>

                        <ChevronDown
                            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60"
                            aria-hidden="true"
                        />
                    </div>

                    <FormMessage className="text-xs" />
                </FormItem>
            )}
        />
    );
}

/* ============================================================
   TEXTAREA
============================================================ */

export function TextAreaField({
                                  control,
                                  name,
                                  label,
                                  optional,
                                  placeholder,
                                  rows = 4,
                              }: {
    control: FieldControl;
    name: FieldName;
    label: string;
    optional?: boolean;
    placeholder?: string;
    rows?: number;
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FieldLabel optional={optional}>{label}</FieldLabel>

                    <FormControl>
                        <textarea
                            {...field}
                            value={(field.value as string | undefined) ?? ""}
                            rows={rows}
                            placeholder={placeholder}
                            className={TEXTAREA_CLASS}
                        />
                    </FormControl>

                    <FormMessage className="text-xs" />
                </FormItem>
            )}
        />
    );
}

/* ============================================================
   STEPPER: tap-friendly replacement for number inputs
============================================================ */

export function StepperField({
                                 control,
                                 name,
                                 label,
                                 optional,
                                 min,
                                 max = 50,
                             }: {
    control: FieldControl;
    name: FieldName;
    label: string;
    optional?: boolean;
    min: number;
    max?: number;
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const value =
                    typeof field.value === "number" && !Number.isNaN(field.value)
                        ? field.value
                        : min;

                const set = (next: number) =>
                    field.onChange(Math.min(max, Math.max(min, next)));

                return (
                    <FormItem>
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 p-2 pl-3.5 shadow-sm">
                            <span className="min-w-0 text-sm font-medium">
                                {label}
                                {optional && (
                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                        optional
                                    </span>
                                )}
                            </span>

                            <div
                                role="group"
                                aria-label={label}
                                className="flex shrink-0 items-center gap-1"
                            >
                                <StepButton
                                    label={`Decrease ${label.toLowerCase()}`}
                                    disabled={value <= min}
                                    onClick={() => set(value - 1)}
                                >
                                    <Minus className="h-4 w-4" aria-hidden="true" />
                                </StepButton>

                                <span
                                    aria-live="polite"
                                    className="w-9 text-center text-base font-semibold tabular-nums"
                                >
                                    {value}
                                </span>

                                <StepButton
                                    label={`Increase ${label.toLowerCase()}`}
                                    disabled={value >= max}
                                    onClick={() => set(value + 1)}
                                >
                                    <Plus className="h-4 w-4" aria-hidden="true" />
                                </StepButton>
                            </div>
                        </div>

                        <FormMessage className="text-xs" />
                    </FormItem>
                );
            }}
        />
    );
}

function StepButton({
                        label,
                        disabled,
                        onClick,
                        children,
                    }: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground transition-all hover:border-coral/40 hover:text-coral active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
        >
            {children}
        </button>
    );
}

/* ============================================================
   CHECKBOX CARD
============================================================ */

export function CheckboxField({
                                  control,
                                  name,
                                  title,
                                  description,
                              }: {
    control: FieldControl;
    name: FieldName;
    title?: string;
    description: string;
}) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const checked = Boolean(field.value);

                return (
                    <FormItem className="space-y-0">
                        <label
                            className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                                checked
                                    ? "border-coral/30 bg-coral/[0.05]"
                                    : "border-border/60 bg-muted/20 hover:bg-muted/40",
                            )}
                        >
                            <FormControl>
                                <input
                                    type="checkbox"
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                    checked={checked}
                                    onChange={(event) => field.onChange(event.target.checked)}
                                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded accent-coral"
                                />
                            </FormControl>

                            <span className="min-w-0">
                                {title && (
                                    <span className="block text-sm font-medium">{title}</span>
                                )}
                                <span
                                    className={cn(
                                        "block text-xs leading-relaxed text-muted-foreground",
                                        title && "mt-0.5",
                                    )}
                                >
                                    {description}
                                </span>
                            </span>
                        </label>

                        <FormMessage className="mt-1.5 text-xs" />
                    </FormItem>
                );
            }}
        />
    );
}