"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Stepper } from "@/components/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessTypeSelect } from "@/components/business/BusinessTypeSelect";
import { ScheduleStep } from "@/components/business/ScheduleStep";
import { BusinessImage } from "@/components/business/BusinessImage";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PLATFORM_LABELS,
  PAYMENT_PLATFORMS,
  createBusinessSchema,
} from "@/lib/validators";
import {
  buildScheduleDays,
  buildScheduleHours,
  type ScheduleData,
} from "@/lib/schedule";
import type { Business, ApiResponse } from "@/types";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RegistrationFormProps = {
  initialCoordinates: Coordinates;
  onBusinessCreated: (business: Business) => void;
  onChangeLocation?: () => void;
};

type FormFields = {
  name: string;
  type: string;
  address: string;
  phone: string;
  scheduleDays: string;
  scheduleHours: string;
  isDelivery: boolean;
  photoUrl: string;
  paymentMethods: string[];
  paymentPlatform: string;
  paymentNote: string;
};

const EMPTY_FORM: FormFields = {
  name: "",
  type: "",
  address: "",
  phone: "",
  scheduleDays: "",
  scheduleHours: "",
  isDelivery: false,
  photoUrl: "",
  paymentMethods: ["cash"],
  paymentPlatform: "enzona",
  paymentNote: "",
};

const EMPTY_SCHEDULE: ScheduleData = {
  days: [],
  openTime: { hour: 9, minute: 0, period: "AM" },
  closeTime: { hour: 5, minute: 0, period: "PM" },
};

const FORM_ID = "business-registration-form";
const TOTAL_STEPS = 4;

const STEP_TITLES = [
  { title: "Details", description: "Name, type & address" },
  { title: "Extras", description: "Delivery & photo" },
  { title: "Schedule", description: "Days & opening hours" },
  { title: "Location", description: "Confirm the spot" },
];

const STEP_SCHEMAS = [
  createBusinessSchema.pick({ name: true, type: true, address: true, phone: true }),
  createBusinessSchema.pick({
    isDelivery: true,
    photoUrl: true,
    paymentMethods: true,
    paymentPlatform: true,
    paymentNote: true,
  }),
  createBusinessSchema.pick({ scheduleDays: true, scheduleHours: true }),
  createBusinessSchema.pick({ latitude: true, longitude: true }),
];

export function RegistrationForm({
  initialCoordinates,
  onBusinessCreated,
  onChangeLocation,
}: RegistrationFormProps) {
  const [fields, setFields] = useState<FormFields>(EMPTY_FORM);
  const [scheduleData, setScheduleData] = useState<ScheduleData>(EMPTY_SCHEDULE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  function updateField(field: keyof FormFields, value: string | boolean) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }

  function updatePhone(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 12);
    updateField("phone", digitsOnly);
  }

  function togglePaymentMethod(method: string) {
    setFields((prev) => {
      const exists = prev.paymentMethods.includes(method);
      const next = exists
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method];
      return {
        ...prev,
        paymentMethods: next.length === 0 ? prev.paymentMethods : next,
      };
    });
  }

  function getStepPayload(step: number) {
    switch (step) {
      case 0:
        return {
          name: fields.name,
          type: fields.type,
          address: fields.address,
          phone: fields.phone,
        };
      case 1:
        return {
          isDelivery: fields.isDelivery,
          photoUrl: fields.photoUrl,
          paymentMethods: fields.paymentMethods,
          paymentPlatform: fields.paymentPlatform,
          paymentNote: fields.paymentNote,
        };
      case 2:
        return {
          scheduleDays: buildScheduleDays(scheduleData),
          scheduleHours: buildScheduleHours(scheduleData),
        };
      default:
        return {
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude,
        };
    }
  }

  function goToStep(step: number) {
    const parse = STEP_SCHEMAS[currentStep].safeParse(getStepPayload(currentStep));
    if (!parse.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of parse.error.issues) {
        const field = String(issue.path[0] ?? "general");
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setCurrentStep(step);
  }

  function nextStep() {
    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    }
  }

  function previousStep() {
    setErrors({});
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setSucceeded(false);

    const parse = createBusinessSchema.safeParse({
      name: fields.name,
      type: fields.type,
      address: fields.address,
      phone: fields.phone,
      scheduleDays: buildScheduleDays(scheduleData),
      scheduleHours: buildScheduleHours(scheduleData),
      isDelivery: fields.isDelivery,
      photoUrl: fields.photoUrl,
      paymentMethods: fields.paymentMethods,
      paymentPlatform: fields.paymentPlatform,
      paymentNote: fields.paymentNote,
      latitude: initialCoordinates.latitude,
      longitude: initialCoordinates.longitude,
    });

    if (!parse.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of parse.error.issues) {
        const field = String(issue.path[0] ?? "general");
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const includesTransfer = parse.data.paymentMethods.includes("transfer");
      const response = await fetch("/api/v1/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parse.data,
          scheduleDays: parse.data.scheduleDays || undefined,
          scheduleHours: parse.data.scheduleHours || undefined,
          photoUrl: parse.data.photoUrl || undefined,
          paymentPlatform: includesTransfer
            ? parse.data.paymentPlatform || undefined
            : undefined,
          paymentNote: includesTransfer
            ? parse.data.paymentNote || undefined
            : undefined,
        }),
      });

      const result = (await response.json()) as ApiResponse<Business>;

      if (!response.ok || !result.success || !result.data) {
        setGeneralError(result.error ?? "An error occurred while registering the business");
        return;
      }

      onBusinessCreated(result.data);
      setFields(EMPTY_FORM);
      setScheduleData(EMPTY_SCHEDULE);
      setErrors({});
      setSucceeded(true);
      setCurrentStep(0);
    } catch {
      setGeneralError("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register my business</CardTitle>
        <CardDescription>
          Fill in the details and you will appear on the map instantly.
        </CardDescription>
      </CardHeader>

      <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-5 pb-10">
          <Stepper
            steps={STEP_TITLES.map(({ title, description }, i) => ({
              title,
              description,
              icon: i === 0 ? <Store className="size-4" /> : undefined,
            }))}
            currentStep={currentStep}
            orientation="horizontal"
            onStepClick={(i) => goToStep(i)}
          />

          {currentStep === 0 && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Business name</FieldLabel>
                <Input
                  id="name"
                  value={fields.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. La Familia Grocery"
                  maxLength={100}
                />
                {errors.name && (
                  <FieldDescription className="text-destructive">
                    {errors.name}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="type">Business type</FieldLabel>
                <BusinessTypeSelect
                  id="type"
                  value={fields.type}
                  onChange={(value) => updateField("type", value ?? "")}
                />
                {errors.type && (
                  <FieldDescription className="text-destructive">
                    {errors.type}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  value={fields.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Street, number and municipality"
                  maxLength={200}
                />
                {errors.address && (
                  <FieldDescription className="text-destructive">
                    {errors.address}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={fields.phone}
                  onChange={(e) => updatePhone(e.target.value)}
                  placeholder="At least 8 digits"
                />
                {errors.phone && (
                  <FieldDescription className="text-destructive">
                    {errors.phone}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          )}

          {currentStep === 1 && (
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="is-delivery">Home delivery</FieldLabel>
                  <FieldDescription>
                    Enable this option if you offer home deliveries.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="is-delivery"
                  checked={fields.isDelivery}
                  onCheckedChange={(checked) =>
                    updateField("isDelivery", checked)
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="photo-url">Photo URL (optional)</FieldLabel>
                <div className="flex items-center gap-3">
                  {fields.photoUrl ? (
                    <BusinessImage
                      key={fields.photoUrl}
                      src={fields.photoUrl}
                      alt="Business preview"
                      className="size-10 shrink-0 rounded-full border border-border"
                      iconClassName="size-5"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                      <ImagePlus className="size-5" />
                    </div>
                  )}
                  <Input
                    id="photo-url"
                    type="url"
                    value={fields.photoUrl}
                    onChange={(e) => updateField("photoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    maxLength={500}
                  />
                </div>
                {errors.photoUrl && (
                  <FieldDescription className="text-destructive">
                    {errors.photoUrl}
                  </FieldDescription>
                )}
              </Field>

              <div className="border-t border-border pt-1" />

              <Field>
                <FieldLabel>Payment methods</FieldLabel>
                <FieldDescription>
                  Select all the methods your business accepts.
                </FieldDescription>
              </Field>

              <PaymentMethodCard
                method="cash"
                title={PAYMENT_METHOD_LABELS.cash}
                description="Accept cash payments directly at your store."
                checked={fields.paymentMethods.includes("cash")}
                onToggle={() => togglePaymentMethod("cash")}
              />

              <PaymentMethodCard
                method="transfer"
                title={PAYMENT_METHOD_LABELS.transfer}
                description="Accept bank or mobile transfers via Enzona or Transfermóvil."
                checked={fields.paymentMethods.includes("transfer")}
                onToggle={() => togglePaymentMethod("transfer")}
              >
                {fields.paymentMethods.includes("transfer") && (
                  <div className="flex flex-col gap-4 border-t border-border pt-4">
                    <Field>
                      <FieldLabel htmlFor="payment-platform">
                        Transfer platform
                      </FieldLabel>
                      <Select
                        value={fields.paymentPlatform}
                        onValueChange={(value) =>
                          updateField("paymentPlatform", value ?? "enzona")
                        }
                      >
                        <SelectTrigger id="payment-platform" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_PLATFORMS.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {PAYMENT_PLATFORM_LABELS[platform]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.paymentPlatform && (
                        <FieldDescription className="text-destructive">
                          {errors.paymentPlatform}
                        </FieldDescription>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="payment-note">
                        Payment note (optional)
                      </FieldLabel>
                      <Input
                        id="payment-note"
                        value={fields.paymentNote}
                        onChange={(e) => updateField("paymentNote", e.target.value)}
                        placeholder="e.g. Transfers up to 10,000 CUP"
                        maxLength={120}
                      />
                      {errors.paymentNote && (
                        <FieldDescription className="text-destructive">
                          {errors.paymentNote}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                )}
              </PaymentMethodCard>

              {errors.paymentMethods && (
                <FieldDescription className="text-destructive">
                  {errors.paymentMethods}
                </FieldDescription>
              )}
            </FieldGroup>
          )}

          {currentStep === 2 && (
            <ScheduleStep
              value={scheduleData}
              onChange={(next) => {
                setScheduleData(next);
                updateField("scheduleDays", buildScheduleDays(next));
                updateField("scheduleHours", buildScheduleHours(next));
              }}
              daysError={errors.scheduleDays}
              hoursError={errors.scheduleHours}
            />
          )}

          {currentStep === 3 && (
            <FieldGroup>
              <Field>
                <FieldLabel>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    Selected location
                  </span>
                </FieldLabel>
                <FieldDescription>
                  Lat: {initialCoordinates.latitude.toFixed(4)} · Lng:{" "}
                  {initialCoordinates.longitude.toFixed(4)}
                </FieldDescription>
                {onChangeLocation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={onChangeLocation}
                  >
                    Change location
                  </Button>
                )}
              </Field>
            </FieldGroup>
          )}

          {generalError && (
            <p className="text-sm text-destructive">{generalError}</p>
          )}

          {succeeded && (
            <p className="text-sm text-muted-foreground">
              Business registered! It now appears on the map.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={previousStep}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="size-4" /> Back
            </Button>
          ) : (
            <span />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="w-full sm:w-auto"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register business"
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

function PaymentMethodCard({
  method,
  title,
  description,
  checked,
  onToggle,
  children,
}: {
  method: string;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const switchId = `payment-${method}`;

  return (
    <div
      className={
        "flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors " +
        (checked ? "bg-primary/5" : "bg-transparent")
      }
    >
      <Field orientation="horizontal">
        <label htmlFor={switchId} className="flex-1 cursor-pointer">
          <FieldContent>
            <FieldTitle>{title}</FieldTitle>
            <FieldDescription>{description}</FieldDescription>
          </FieldContent>
        </label>
        <Switch
          id={switchId}
          checked={checked}
          onCheckedChange={onToggle}
        />
      </Field>
      {checked && children}
    </div>
  );
}
