"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RowActions } from "@/components/admin/collection-row";
import { Badge, Button, Card, Field, Input, Sheet, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { saveItem } from "@/app/admin/_actions/collections";
import type { Faq } from "@/lib/db/schema";

export function FaqBoard({ items }: { items: Faq[] }) {
  const [edit, setEdit] = useState<Faq | "new" | null>(null);
  const f = edit === "new" ? null : edit;
  const [save, saving] = useServerAction((fd: FormData) => saveItem("faqs", fd), { onSuccess: () => setEdit(null) });
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setEdit("new")}>
          <Plus /> Ajouter une question
        </Button>
      </div>
      <Card>
        <ul className="divide-y divide-encre/8">
          {items.map((q, i) => (
            <li key={q.id} className="flex items-start gap-3 px-4 py-4 md:px-6">
              <button type="button" onClick={() => setEdit(q)} className="min-w-0 flex-1 text-left">
                <span className="block font-medium">{q.question}</span>
                <span className="line-clamp-2 text-sm text-taupe">{q.answer}</span>
                {!q.isPublished && <Badge className="mt-1">Masquée</Badge>}
              </button>
              <RowActions kind="faqs" id={q.id} published={q.isPublished} first={i === 0} last={i === items.length - 1} onEdit={() => setEdit(q)} label={q.question} />
            </li>
          ))}
        </ul>
      </Card>
      <Sheet open={edit !== null} onOpenChange={(v) => !v && setEdit(null)} title={f ? "Modifier la question" : "Nouvelle question"}>
        <form key={f?.id ?? "new"} onSubmit={submitWith((fd) => save(fd).then(() => undefined))} className="space-y-5">
          {f && <input type="hidden" name="id" value={f.id} />}
          <input type="hidden" name="pageKey" value={f?.pageKey ?? "home"} />
          <Field label="Question" htmlFor="question">
            <Input id="question" name="question" defaultValue={f?.question} required />
          </Field>
          <Field label="Réponse" htmlFor="answer">
            <Textarea id="answer" name="answer" rows={6} defaultValue={f?.answer} required />
          </Field>
          <Switch name="isPublished" defaultChecked={f?.isPublished ?? true} label="Visible sur le site" />
          <Button type="submit" loading={saving} className="w-full">
            Enregistrer et publier
          </Button>
        </form>
      </Sheet>
    </>
  );
}
