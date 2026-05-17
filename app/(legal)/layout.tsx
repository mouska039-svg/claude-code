import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center">
          <Link
            href="/"
            className="font-fraunces text-xl font-semibold text-ink hover:opacity-80 transition-opacity"
          >
            naya
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-2 ml-0.5" />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">{children}</main>
    </div>
  );
}
