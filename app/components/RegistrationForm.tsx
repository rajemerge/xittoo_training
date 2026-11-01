"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import provincesData from "@/app/data/provinces.json";
import districtsData from "@/app/data/districts.json";
import municipalitiesData from "@/app/data/municipalities.json";
import {
  EDUCATION_LEVELS,
  registrationSchema,
  toFieldErrors,
} from "@/lib/validation";

type Errors = Record<string, string>;

type Province = {
  code: string;
  name_en: string;
  name_ne: string;
};

type District = {
  code: string;
  name_en: string;
  name_ne: string;
  province_code: string;
};

type LocalLevel = {
  code: string;
  name_en: string;
  name_ne: string;
  district_code: string;
  province_code: string;
  type_en: string;
  type_ne: string;
};

const provinces = provincesData as Province[];
const districtsDataList = districtsData as District[];
const localLevels = municipalitiesData as LocalLevel[];

const TRAINING_OPTIONS = [{ value: "HOME_APPLIANCE", label: "Home Appliance" }];

export default function RegistrationForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);

  const [hasExperience, setHasExperience] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [selectedMunicipality, setSelectedMunicipality] = useState("");

  const districts = useMemo(
    () =>
      districtsDataList.filter(
        (district) => district.province_code === selectedProvince,
      ),
    [selectedProvince],
  );

  const municipalities = useMemo(
    () =>
      localLevels.filter(
        (item) =>
          item.district_code === selectedDistrict &&
          item.province_code === selectedProvince,
      ),
    [selectedDistrict, selectedProvince],
  );

  const inputClass = (name: string) =>
    `h-11 w-full min-w-0 rounded-xl border bg-[#f9fcff] px-3.5 text-sm text-[#0c1b33] outline-none transition placeholder:text-slate-400 focus:border-[#0a4da3] focus:ring-2 focus:ring-[#0a4da3]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
      errors[name] ? "border-red-500 bg-red-50" : "border-[#c8d7e9]"
    }`;

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-[#173c70]";

  const err = (name: string) =>
    errors[name] ? (
      <p className="mt-1 text-xs font-medium text-red-600" id={`${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  const a11y = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    console.log("summing");

    const fd = new FormData(e.currentTarget);

    const payload = {
      fullName: fd.get("fullName"),
      phone: fd.get("phone"),
      email: fd.get("email") ?? "",
      age: fd.get("age"),
      gender: fd.get("gender") ?? undefined,

      province: fd.get("province"),
      district: fd.get("district"),
      municipality: fd.get("municipality"),
      streetAddress: fd.get("streetAddress"),

      education: fd.get("education"),
      training: fd.get("training"),

      hasExperience,
      experienceNote: hasExperience
        ? (fd.get("experienceNote") ?? "")
        : undefined,

      consent: fd.get("consent") === "on",
      website: fd.get("website") ?? "",
    };

    const check = registrationSchema.safeParse(payload);
    console.log("cheking");

    if (!check.success) {
      console.log("dasld");
      const fieldErrors = toFieldErrors(check.error);
      setErrors(fieldErrors);
      console.log(errors);

      const firstError = Object.keys(fieldErrors)[0];

      document.getElementById(firstError)?.focus();

      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(check.data),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }

        setFormError(data.message ?? "Something went wrong. Please try again.");

        return;
      }

      setDoneId(data.id);
    } catch {
      setFormError(
        "Could not reach the server. Check your internet connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (doneId !== null) {
    return (
      <div
        className="rounded-2xl border border-[#d6e3f3] border-t-8 border-t-[#ffd60a] bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-9"
        role="status"
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf4ff] text-3xl font-bold text-[#0a4da3]">
          ✓
        </div>

        <h2 className="text-2xl font-bold text-[#0a4da3] sm:text-3xl">
          You are registered!
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#52647f]">
          Thank you for registering with Xittoo Sewa! Our team will review your
          application and contact you at the phone number you provided if you
          are selected. We will also guide you through the next steps of the
          Banepa training program.
        </p>

        {doneId > 0 && (
          <div className="mt-6 rounded-xl bg-[#eaf4ff] p-4">
            <p className="text-xs font-semibold text-[#52647f]">
              Your registration number
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wider text-[#052f6b]">
              {String(doneId).padStart(4, "0")}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#d6e3f3] border-t-[7px] border-t-[#ffd60a] bg-white shadow-xl shadow-blue-900/10"
    >
      <div className="m-4">
        <h2
          id="form-title"
          className="text-3xl font-bold leading-tight text-[#052f6b] sm:text-4xl"
        >
          Register for the training
        </h2>

        <p className="mt-1 ml-1 text-sm leading-relaxed text-[#3a4d6b]">
          It takes about few second. Fields marked{" "}
          <span className="font-bold text-red-600">*</span> are required.
        </p>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className={labelClass}>
              Full name <span className="text-red-600">*</span>
            </label>

            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Enter your full name"
              className={inputClass("fullName")}
              {...a11y("fullName")}
            />

            {err("fullName")}
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Mobile number <span className="text-red-600">*</span>
            </label>

            <input
              id="phone"
              name="phone"
              inputMode="numeric"
              maxLength={10}
              placeholder="98XXXXXXXX"
              autoComplete="tel"
              className={inputClass("phone")}
              {...a11y("phone")}
            />

            {err("phone")}
          </div>

          <div>
            <label htmlFor="age" className={labelClass}>
              Age <span className="text-red-600">*</span>
            </label>

            <input
              id="age"
              name="age"
              type="number"
              inputMode="numeric"
              min={16}
              max={60}
              placeholder="Enter your age"
              className={inputClass("age")}
              {...a11y("age")}
            />

            {err("age")}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
              Email{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="yourname@example.com"
              className={inputClass("email")}
              {...a11y("email")}
            />

            {err("email")}
          </div>

          <fieldset className="min-w-0 sm:col-span-2" id="gender" tabIndex={-1}>
            <legend className={labelClass}>
              Gender <span className="text-red-600">*</span>
            </legend>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["MALE", "Male"],
                ["FEMALE", "Female"],
                ["OTHER", "Other"],
              ].map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    className="peer sr-only"
                  />

                  <span className="flex h-11 items-center justify-center rounded-xl border border-[#c8d7e9] bg-[#f9fcff] text-sm font-semibold text-[#52647f] transition peer-checked:border-[#0a4da3] peer-checked:bg-[#0a4da3] peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#ffd60a]">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            {err("gender")}
          </fieldset>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className={labelClass}>
              Province <span className="text-red-600">*</span>
            </label>

            <select
              id="province"
              name="province"
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict("");
                setSelectedMunicipality("");
              }}
              className={inputClass("province")}
              {...a11y("province")}
            >
              <option value="">Select province</option>

              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name_en}
                </option>
              ))}
            </select>

            {err("province")}
          </div>

          <div>
            <label htmlFor="district" className={labelClass}>
              District <span className="text-red-600">*</span>
            </label>

            <select
              id="district"
              name="district"
              value={selectedDistrict}
              disabled={!selectedProvince}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedMunicipality("");
              }}
              className={inputClass("district")}
              {...a11y("district")}
            >
              <option value="">Select district</option>

              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name_en}
                </option>
              ))}
            </select>

            {err("district")}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="municipality" className={labelClass}>
              Municipality / Rural Municipality{" "}
              <span className="text-red-600">*</span>
            </label>

            <select
              id="municipality"
              name="municipality"
              value={selectedMunicipality}
              disabled={!selectedDistrict}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className={inputClass("municipality")}
              {...a11y("municipality")}
            >
              <option value="">Select municipality</option>

              {municipalities.map((municipality) => (
                <option key={municipality.name_en} value={municipality.name_en}>
                  {municipality.name_en}
                </option>
              ))}
            </select>

            {err("municipality")}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="streetAddress" className={labelClass}>
              Street / Tole / Ward
              {/* <span className="text-red-600">*</span> */}
            </label>

            <input
              id="streetAddress"
              name="streetAddress"
              autoComplete="street-address"
              placeholder="e.g. Ward 5, Banepa, near bus park"
              className={inputClass("streetAddress")}
              {...a11y("streetAddress")}
            />

            {err("streetAddress")}
          </div>
        </div>

        <div>
          <label htmlFor="training" className={labelClass}>
            Training Program <span className="text-red-600">*</span>
          </label>

          <select
            id="training"
            name="training"
            defaultValue="HOME_APPLIANCE"
            className={inputClass("training")}
            {...a11y("training")}
          >
            {TRAINING_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {err("training")}
        </div>

        <div>
          <label htmlFor="education" className={labelClass}>
            Education <span className="text-red-600">*</span>
          </label>

          <select
            id="education"
            name="education"
            defaultValue=""
            className={inputClass("education")}
            {...a11y("education")}
          >
            <option value="" disabled>
              Select education
            </option>

            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          {err("education")}
        </div>

        <div className="">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={hasExperience}
              onChange={(e) => setHasExperience(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-[#0a4da3]"
            />

            <span className="text-sm font-medium text-[#173c70]">
              I have worked on appliance repair before
            </span>
          </label>

          {hasExperience && (
            <div className="mt-3">
              <label htmlFor="experienceNote" className={labelClass}>
                Describe your experience
              </label>

              <textarea
                id="experienceNote"
                name="experienceNote"
                rows={2}
                maxLength={500}
                placeholder="Example: AC servicing, fridge repair..."
                className={`${inputClass("experienceNote")} h-auto min-h-20 resize-y py-3`}
                {...a11y("experienceNote")}
              />

              {err("experienceNote")}
            </div>
          )}
        </div>

        <section className="">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl">
            <input
              id="consent"
              type="checkbox"
              name="consent"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#0a4da3]"
              {...a11y("consent")}
            />

            <span className="text-xs font-semibold text-[#52647f]">
              I confirm that the information provided above is correct and I can
              attend the training in Banepa.{" "}
              {/* <span className="font-bold text-red-600">*</span> */}
            </span>
          </label>

          {err("consent")}
        </section>

        {formError && (
          <p
            className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium leading-relaxed text-red-700"
            role="alert"
          >
            {formError}
          </p>
        )}

        <div className="border-t border-[#e5edf7] pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ffd60a] px-5 py-3 text-sm font-bold text-[#052f6b] shadow-[0_3px_0_#052f6b] transition hover:bg-[#ffca05] active:translate-y-[2px] active:shadow-none disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#052f6b]/30 border-t-[#052f6b]" />
                Registering...
              </>
            ) : (
              <>
                Register now
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
            By registering, you agree to be contacted by the Xittoo Sewa team
            regarding the training program.
          </p>
        </div>
      </div>
    </form>
  );
}
