import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

import { CATEGORIES } from "@/lib/hours/categories";

const APP_VERSION = "0.1.0";

/**
 * Ficha rápida do protótipo: versão, contexto (Hackathon) e as cargas
 * horárias exigidas por categoria — puxadas de CATEGORIES em vez de
 * hardcoded, pra nunca ficar desatualizado se as 90h/330h mudarem.
 */
export function AboutSection() {
  return (
    <section aria-labelledby="sobre-heading" className="card">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        >
          <Info className="h-5 w-5" />
        </span>
        <div>
          <h2
            id="sobre-heading"
            className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
          >
            Sobre o CertiBox
          </h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Protótipo navegável de alta fidelidade para gestão pessoal de horas complementares e
            de extensão, desenvolvido para o Hackathon SeCoT XVIII (UFSCar Sorocaba). A interface
            já foi pensada para uma eventual integração com os sistemas oficiais da UFSCar, mas
            funciona de forma independente por enquanto.
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-900 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
            Versão do protótipo
          </dt>
          <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">{APP_VERSION}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
            Instituição
          </dt>
          <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
            UFSCar — campus Sorocaba
          </dd>
        </div>
        {CATEGORIES.map((category) => (
          <div key={category.key}>
            <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-500">
              {category.label}
            </dt>
            <dd className="mt-0.5 text-neutral-900 dark:text-neutral-100">
              {category.requiredHours}h exigidas
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href="/regulamentos"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline dark:text-primary-400"
      >
        Ver regulamentos oficiais
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}
