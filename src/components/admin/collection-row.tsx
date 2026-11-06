"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button, ConfirmDialog } from "./ui";
import { useServerAction } from "./use-action";
import { deleteItem, moveItem, togglePublished } from "@/app/admin/_actions/collections";

type Kind = "gallery" | "areas" | "faqs" | "testimonials";

/** Boutons communs : ordre, visibilité, modification, suppression avec confirmation. */
export function RowActions({ kind, id, published, first, last, onEdit, label }: { kind: Kind; id: string; published: boolean; first: boolean; last: boolean; onEdit: () => void; label: string }) {
  const [move] = useServerAction(moveItem);
  const [toggle] = useServerAction(togglePublished);
  const [remove] = useServerAction(deleteItem);
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button variant="ghost" size="icon" aria-label="Monter" disabled={first} onClick={() => move(kind, id, -1)}>
        <ArrowUp />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Descendre" disabled={last} onClick={() => move(kind, id, 1)}>
        <ArrowDown />
      </Button>
      <Button variant="ghost" size="icon" aria-label={published ? "Masquer" : "Publier"} onClick={() => toggle(kind, id, !published)}>
        {published ? <Eye /> : <EyeOff />}
      </Button>
      <Button variant="ghost" size="icon" aria-label="Modifier" onClick={onEdit}>
        <Pencil />
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="danger-ghost" size="icon" aria-label="Supprimer">
            <Trash2 />
          </Button>
        }
        title="Supprimer ?"
        description={`« ${label} » sera supprimé définitivement.`}
        onConfirm={() => remove(kind, id).then(() => undefined)}
      />
    </div>
  );
}
