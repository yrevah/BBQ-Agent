"use client";

import { useActionState } from "react";
import {
  connectDriveFolderAction,
  type ConnectDriveResult,
} from "./actions";

export function DriveForm({ initialFolderName }: { initialFolderName?: string }) {
  const [state, formAction, pending] = useActionState<
    ConnectDriveResult | null,
    FormData
  >(connectDriveFolderAction, null);

  return (
    <form action={formAction} className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        BBQ folder URL or ID
      </label>
      <input
        name="folder"
        defaultValue={initialFolderName ? "" : ""}
        placeholder="https://drive.google.com/drive/folders/…"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        required
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Checking…" : initialFolderName ? "Update folder" : "Connect folder"}
        </button>
        {state?.ok && (
          <span className="text-sm text-emerald-700">
            Connected to {state.folderName}.
          </span>
        )}
        {state && !state.ok && (
          <span className="text-sm text-red-700">{state.error}</span>
        )}
      </div>
    </form>
  );
}
