"use client";

import { AnimatePresence, motion } from "motion/react";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Monogram } from "@/components/brand/monogram";
import { submitAppointmentRequest, type RequestState } from "@/lib/services/requests";
import { cn, telHref } from "@/lib/utils";

const SLOTS = ["Matin (9h – 12h)", "Midi (12h – 14h)", "Après-midi (14h – 17h)", "Fin de journée (17h – 20h)", "Indifférent"];

type Props = {
  services: string[];
  communes: string[];
  defaultService?: string;
  phone: string;
  phoneE164: string;
  source: string;
  tone?: "light" | "dark";
};

/** Formulaire de DEMANDE de rendez-vous — la confirmation se fait ensuite par Angèle. */
export function RequestForm({ services, communes, defaultService, phone, phoneE164, source, tone = "light" }: Props) {
  const [state, action, pending] = useActionState<RequestState, FormData>(submitAppointmentRequest, { status: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const dark = tone === "dark";
  const err = state.status === "error" ? state.fieldErrors ?? {} : {};
  const today = new Date().toISOString().slice(0, 10);
  const serviceOptions = defaultService && !services.includes(defaultService) ? [defaultService, ...services] : services;

  useEffect(() => setStartedAt(Date.now()), []);
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state.status]);

  const field = cn(
    "peer w-full border-0 border-b bg-transparent px-0 pb-3 pt-6 text-[1.05rem] outline-none transition-colors placeholder:text-transparent focus:ring-0",
    dark ? "border-ivoire/25 text-ivoire focus:border-champagne" : "border-encre/25 text-encre focus:border-or-profond",
  );
  const label = cn(
    "pointer-events-none absolute left-0 top-6 origin-left text-[1.02rem] transition-all duration-300",
    "peer-focus:-translate-y-5 peer-focus:scale-[0.82] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:scale-[0.82]",
    dark ? "text-ivoire/60" : "text-taupe",
  );
  const staticLabel = cn("mb-1 block text-[0.85rem]", dark ? "text-ivoire/60" : "text-taupe");
  const errorText = "mt-2 text-sm text-[#b3412f]";

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state.status === "success" ? (
          <motion.div
            key="ok"
            ref={successRef}
            tabIndex={-1}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative overflow-hidden border p-10 outline-none md:p-14", dark ? "border-ivoire/15" : "border-encre/15 bg-lin")}
          >
            <Monogram aria-hidden title="" className="absolute -right-10 -top-6 w-56 text-champagne/10" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne text-noir">
              <Check className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="t-h3 mt-8">Merci{state.firstName ? ` ${state.firstName}` : ""}, votre demande est bien envoyée.</h3>
            <p className={cn("mt-4 max-w-lg", dark ? "text-ivoire/70" : "text-taupe")}>
              Il s&apos;agit d&apos;une demande : votre rendez-vous n&apos;est pas encore confirmé. Angèle vous recontacte dans les meilleurs
              délais pour convenir ensemble du jour et de l&apos;heure.
            </p>
            <p className={cn("mt-6 text-sm", dark ? "text-ivoire/60" : "text-taupe")}>
              Une question urgente ?{" "}
              <a href={telHref(phoneE164)} className="underline underline-offset-4">
                Appelez le {phone}
              </a>
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            // Soumission manuelle : React ne vide pas le formulaire en cas d'erreur de saisie.
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(() => action(fd));
            }}
            noValidate
            className="grid gap-x-8 gap-y-7 sm:grid-cols-2"
            exit={{ opacity: 0, y: -10 }}
            aria-describedby={state.status === "error" ? `${uid}-err` : undefined}
          >
            <input type="hidden" name="startedAt" value={startedAt} />
            <input type="hidden" name="sourcePage" value={source} />
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Site web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="relative sm:col-span-2">
              <input id={`${uid}-name`} name="fullName" className={field} placeholder=" " autoComplete="name" required aria-invalid={!!err.fullName} />
              <label htmlFor={`${uid}-name`} className={label}>
                Nom et prénom
              </label>
              {err.fullName && <p className={errorText}>{err.fullName}</p>}
            </div>
            <div className="relative">
              <input id={`${uid}-tel`} name="phone" type="tel" inputMode="tel" className={field} placeholder=" " autoComplete="tel" required aria-invalid={!!err.phone} />
              <label htmlFor={`${uid}-tel`} className={label}>
                Téléphone
              </label>
              {err.phone && <p className={errorText}>{err.phone}</p>}
            </div>
            <div className="relative">
              <input id={`${uid}-mail`} name="email" type="email" className={field} placeholder=" " autoComplete="email" aria-invalid={!!err.email} />
              <label htmlFor={`${uid}-mail`} className={label}>
                E-mail (facultatif)
              </label>
              {err.email && <p className={errorText}>{err.email}</p>}
            </div>
            <div className="relative">
              <input
                id={`${uid}-commune`}
                name="commune"
                list={`${uid}-communes`}
                className={field}
                placeholder=" "
                autoComplete="address-level2"
                required
                aria-invalid={!!err.commune}
              />
              <label htmlFor={`${uid}-commune`} className={label}>
                Commune d&apos;intervention
              </label>
              <datalist id={`${uid}-communes`}>
                {communes.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {err.commune && <p className={errorText}>{err.commune}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-svc`} className={staticLabel}>
                Prestation souhaitée
              </label>
              <select
                id={`${uid}-svc`}
                name="service"
                defaultValue={defaultService ?? ""}
                required
                aria-invalid={!!err.service}
                className={cn(field, "cursor-pointer appearance-none pt-1", dark && "[&>option]:text-encre")}
              >
                <option value="" disabled>
                  Choisir…
                </option>
                {serviceOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {err.service && <p className={errorText}>{err.service}</p>}
            </div>
            <div>
              <label htmlFor={`${uid}-date`} className={staticLabel}>
                Date souhaitée
              </label>
              <input id={`${uid}-date`} name="preferredDate" type="date" min={today} className={cn(field, "pt-1", dark && "[color-scheme:dark]")} />
              {err.preferredDate && <p className={errorText}>{err.preferredDate}</p>}
            </div>
            <fieldset>
              <legend className={staticLabel}>Créneau préféré</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <label key={s} className="cursor-pointer">
                    <input type="radio" name="timeSlot" value={s} className="peer sr-only" />
                    <span
                      className={cn(
                        "inline-flex min-h-10 items-center border px-3.5 text-sm transition-colors peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-noir peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-champagne",
                        dark ? "border-ivoire/25 text-ivoire/80" : "border-encre/20 text-encre/80",
                      )}
                    >
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="relative sm:col-span-2">
              <textarea id={`${uid}-msg`} name="message" rows={4} className={cn(field, "resize-y")} placeholder=" " maxLength={2000} />
              <label htmlFor={`${uid}-msg`} className={label}>
                Votre message (longueur, couleur actuelle, nombre de personnes…)
              </label>
              {err.message && <p className={errorText}>{err.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-or-profond)]"
                  aria-invalid={!!err.consent}
                />
                <span className={dark ? "text-ivoire/70" : "text-taupe"}>
                  J&apos;accepte que mes données soient utilisées par Hair Home Concept pour traiter ma demande et me recontacter. Elles ne sont
                  jamais transmises à des tiers.{" "}
                  <a href="/confidentialite" className="underline underline-offset-4">
                    En savoir plus
                  </a>
                </span>
              </label>
              {err.consent && <p className={errorText}>{err.consent}</p>}
            </div>

            {state.status === "error" && (
              <p id={`${uid}-err`} role="alert" className="text-sm text-[#b3412f] sm:col-span-2">
                {state.message}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="group/btn relative isolate inline-flex min-h-14 items-center justify-center overflow-hidden bg-champagne px-10 text-base text-noir before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-champagne-clair before:transition-transform before:duration-700 hover:before:scale-x-100 disabled:opacity-70"
              >
                {pending ? "Envoi en cours…" : "Envoyer ma demande"}
              </button>
              <p className={cn("text-sm", dark ? "text-ivoire/55" : "text-taupe")}>Réponse personnalisée, sans engagement.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
