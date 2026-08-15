"use client";

import { useActionState } from "react";
import {
  connectLibraryAction,
  type ConnectLibraryResult,
  type LibraryConfig,
} from "./actions";

export function LibraryForm({ current }: { current: LibraryConfig | null }) {
  const [state, formAction, pending] = useActionState<
    ConnectLibraryResult | null,
    FormData
  >(connectLibraryAction, null);

  return (
    <form action={formAction} className="space-y-2">
      <label
        htmlFor="rootPath"
        className="block text-sm font-medium text-neutral-700"
      >
        Folder path
      </label>
      <input
        id="rootPath"
        name="rootPath"
        defaultValue={current?.rootPath ?? ""}
        placeholder="~/Google Drive/My Drive/BBQ"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-neutral-500 focus:outline-none"
        required
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Scanning…" : current ? "Update folder" : "Connect folder"}
        </button>
        {state?.ok && (
          <span className="text-sm text-emerald-700">
            Found {state.config.fileCount} files (
            {state.config.extractableCount} readable as text).
          </span>
        )}
        {state && !state.ok && (
          <span className="text-sm text-red-700">{state.error}</span>
        )}
      </div>
    </form>
  );
}
