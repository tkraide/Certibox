"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AlertTriangle, FileUp } from "lucide-react";

import { CATEGORIES, getCategoryConfig, type CategoryKey } from "@/lib/hours/categories";
import type { CategoryProgress } from "@/lib/hours/aggregate";
import type { UploadCertificateInput } from "@/hooks/use-certificates";
import { Dialog, type DialogHandle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mesmo limite aplicado no bucket "certificados" do Storage (ver migração).
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

type DraftCertificate = UploadCertificateInput;

type UploadDialogProps = {
  open: boolean;
  onClose: () => void;
  progress: CategoryProgress[];
  onSaved: (input: UploadCertificateInput) => Promise<void>;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function UploadDialog({ open, onClose, progress, onSaved }: UploadDialogProps) {
  const dialogRef = useRef<DialogHandle>(null);
  const formId = useId();

  const [title, setTitle] = useState("");
  const [categoryKey, setCategoryKey] = useState<CategoryKey>(CATEGORIES[0].key);
  const [hours, setHours] = useState("");
  const [activityDate, setActivityDate] = useState(todayIsoDate());
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<DraftCertificate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      setTitle("");
      setCategoryKey(CATEGORIES[0].key);
      setHours("");
      setActivityDate(todayIsoDate());
      setFile(null);
      setError(null);
      setPendingConfirm(null);
      setSubmitting(false);
    }
  }, [open]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);

    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_MIME_TYPES.includes(selected.type)) {
      setError("Envie uma imagem (PNG, JPG, WEBP) ou um PDF.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setError("O arquivo precisa ter até 4MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function getSelectedCategoryProgress(): CategoryProgress {
    return progress.find((p) => p.key === categoryKey) ?? progress[0];
  }

  async function saveCertificate(draft: DraftCertificate) {
    try {
      await onSaved(draft);
      onClose();
    } catch {
      setError("Não foi possível salvar o certificado. Tente novamente.");
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const parsedHours = Number(hours);

    if (!trimmedTitle) {
      setError("Informe o nome da atividade.");
      return;
    }
    if (!hours || Number.isNaN(parsedHours) || parsedHours <= 0) {
      setError("Informe uma carga horária válida (em horas).");
      return;
    }
    if (!activityDate) {
      setError("Informe a data da atividade.");
      return;
    }
    if (!file) {
      setError("Selecione um arquivo de imagem ou PDF.");
      return;
    }

    const draft: DraftCertificate = {
      title: trimmedTitle,
      category: categoryKey,
      hours: parsedHours,
      activityDate,
      file,
    };

    const categoryProgress = getSelectedCategoryProgress();
    if (parsedHours > categoryProgress.availableHours) {
      // Ultrapassa o limite restante da categoria — pede confirmação antes de salvar.
      setPendingConfirm(draft);
      return;
    }

    setSubmitting(true);
    await saveCertificate(draft);
  }

  async function handleConfirmAnyway() {
    if (!pendingConfirm) return;
    setSubmitting(true);
    await saveCertificate(pendingConfirm);
  }

  const categoryProgress = getSelectedCategoryProgress();

  return (
    <Dialog
      ref={dialogRef}
      titleId="upload-dialog-title"
      title="Adicionar certificado"
      onClose={onClose}
      className="max-w-lg"
    >
      {pendingConfirm ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-3 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Este certificado tem <strong>{pendingConfirm.hours}h</strong>, mas a categoria{" "}
              <strong>{getCategoryConfig(pendingConfirm.category).label}</strong> só tem{" "}
              <strong>{categoryProgress.availableHours}h</strong> disponíveis (considerando o que
              já foi aprovado e o que está pendente). Ele pode não ser validado pelo professor.
              Quer enviar assim mesmo?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingConfirm(null)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Voltar e editar
            </button>
            <button
              type="button"
              onClick={handleConfirmAnyway}
              disabled={submitting}
              className={cn(
                "rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400",
                submitting && "cursor-not-allowed opacity-60",
              )}
            >
              Enviar mesmo assim
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={`${formId}-title`}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Nome da atividade
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Minicurso de Docker"
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`${formId}-category`}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Categoria
              </label>
              <select
                id={`${formId}-category`}
                value={categoryKey}
                onChange={(event) => setCategoryKey(event.target.value as CategoryKey)}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`${formId}-hours`}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Carga horária (h)
              </label>
              <input
                id={`${formId}-hours`}
                type="number"
                min={1}
                step={1}
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="Ex: 8"
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-date`}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Data da atividade
            </label>
            <input
              id={`${formId}-date`}
              type="date"
              value={activityDate}
              max={todayIsoDate()}
              onChange={(event) => setActivityDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Horas faltantes em {categoryProgress.label}: {categoryProgress.availableHours}h de{" "}
            {categoryProgress.requiredHours}h.
          </p>

          <div>
            <label
              htmlFor={`${formId}-file`}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Certificado (imagem ou PDF)
            </label>
            <label
              htmlFor={`${formId}-file`}
              className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            >
              <FileUp className="h-5 w-5" aria-hidden="true" />
              {file ? (
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {file.name}
                </span>
              ) : (
                <span>Clique para selecionar (PNG, JPG, WEBP ou PDF — até 4MB)</span>
              )}
            </label>
            <input
              id={`${formId}-file`}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-neutral-800 dark:text-neutral-200">
              {error}
            </p>
          )}

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <strong className="text-neutral-800 dark:text-neutral-200">
              Nota de privacidade (LGPD):
            </strong>{" "}
            o arquivo e os dados enviados aqui são usados apenas para validar suas horas
            complementares/de extensão junto à UFSCar e ficam visíveis ao professor responsável
            pela aprovação. Você pode pedir a remoção dos seus dados a qualquer momento.
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary-400",
                submitting && "cursor-not-allowed opacity-60",
              )}
            >
              {submitting ? "Enviando..." : "Enviar certificado"}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
