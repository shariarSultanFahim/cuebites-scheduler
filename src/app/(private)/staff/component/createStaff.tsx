"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Gender, StaffType } from "@/generated/prisma/enums";
import { getAllCountries, type Country } from "@/lib/countries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createStaff } from "../../../api/staff/create";
import { staffSchema } from "../../../api/staff/schema";

type FormData = z.infer<typeof staffSchema>;

export function CreateStaff({
  onStaffCreated,
}: {
  onStaffCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [countries, setCountries] = useState<Country[]>([]);
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      type: StaffType.PERMANENT,
      nationality: "AU",
      Country: "AU",
    },
  });

  const selectedNationality = watch("nationality");
  const selectedCountry = watch("Country");

  useEffect(() => {
    setCountries(getAllCountries());
  }, []);

  const filteredNationalities = countries.filter((country) =>
    country.name.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleNationalitySelect = (code: string) => {
    setValue("nationality", code);
    setShowNationalityDropdown(false);
    setNationalitySearch("");
  };

  const handleCountrySelectChange = (code: string) => {
    setValue("Country", code);
    setShowCountryDropdown(false);
    setCountrySearch("");
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    startTransition(async () => {
      const result = await createStaff(formData);
      if (result.success) {
        toast.success("Staff created successfully");
        reset();
        setOpen(false);
        onStaffCreated?.();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            setError(key as keyof FormData, {
              message: (value as string[])[0],
            });
          });
          toast.error(result.message || "Failed to create staff");
        } else {
          setError("root", {
            message: result.message || "Something went wrong",
          });
          toast.error(result.message || "Failed to create staff");
        }
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setNationalitySearch("");
      setCountrySearch("");
      setShowNationalityDropdown(false);
      setShowCountryDropdown(false);
    }
  };

  const selectedNationalityCountry = countries.find(
    (c) => c.code === selectedNationality
  );
  const selectedCountryData = countries.find((c) => c.code === selectedCountry);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Staff</SheetTitle>
          <SheetDescription>
            Create a new staff member here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 py-2 px-4"
        >
          {errors.root && (
            <div className="text-red-500 text-sm">{errors.root.message}</div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              className={errors.full_name ? "border-red-500" : ""}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-red-500 text-xs">{errors.city.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nationality">Nationality</Label>
            <div className="relative">
              <div
                className={`flex h-9 w-full rounded-md border ${
                  errors.nationality ? "border-red-500" : "border-input"
                } bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring cursor-pointer items-center justify-between`}
                onClick={() =>
                  setShowNationalityDropdown(!showNationalityDropdown)
                }
              >
                <span>
                  {selectedNationalityCountry
                    ? selectedNationalityCountry.name
                    : "Select nationality"}
                </span>
                <Search className="h-4 w-4 opacity-50" />
              </div>
              {showNationalityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-input rounded-md bg-white shadow-md z-50">
                  <div className="p-2 border-b border-input">
                    <Input
                      placeholder="Search nationality..."
                      value={nationalitySearch}
                      onChange={(e) => setNationalitySearch(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredNationalities.length > 0 ? (
                      filteredNationalities.map((country) => (
                        <div
                          key={country.code}
                          className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                            selectedNationality === country.code
                              ? "bg-accent font-semibold"
                              : ""
                          }`}
                          onClick={() => handleNationalitySelect(country.code)}
                        >
                          {country.name} ({country.code})
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
              <input type="hidden" {...register("nationality")} />
            </div>
            {errors.nationality && (
              <p className="text-red-500 text-xs">
                {errors.nationality.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="Country">Country</Label>
            <div className="relative">
              <div
                className={`flex h-9 w-full rounded-md border ${
                  errors.Country ? "border-red-500" : "border-input"
                } bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring cursor-pointer items-center justify-between`}
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span>
                  {selectedCountryData
                    ? selectedCountryData.name
                    : "Select country"}
                </span>
                <Search className="h-4 w-4 opacity-50" />
              </div>
              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-input rounded-md bg-white shadow-md z-50">
                  <div className="p-2 border-b border-input">
                    <Input
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                            selectedCountry === country.code
                              ? "bg-accent font-semibold"
                              : ""
                          }`}
                          onClick={() =>
                            handleCountrySelectChange(country.code)
                          }
                        >
                          {country.name} ({country.code})
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
              <input type="hidden" {...register("Country")} />
            </div>
            {errors.Country && (
              <p className="text-red-500 text-xs">{errors.Country.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              {...register("gender")}
              className={`flex h-9 w-full rounded-md border ${
                errors.gender ? "border-red-500" : "border-input"
              } bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option value="">Select gender</option>
              {Object.values(Gender).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs">{errors.gender.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              {...register("type")}
              className={`flex h-9 w-full rounded-md border ${
                errors.type ? "border-red-500" : "border-input"
              } bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {Object.values(StaffType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs">{errors.type.message}</p>
            )}
          </div>

          <SheetFooter className="px-0 pt-4">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isPending || isSubmitting}
              >
                Reset
              </Button>
              <Button
                className="flex-1"
                type="submit"
                disabled={isPending || isSubmitting}
              >
                {(isPending || isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save changes
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
