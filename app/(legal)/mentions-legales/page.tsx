export const metadata = {
  title: "Mentions légales — Naya",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="font-fraunces text-3xl font-semibold text-ink mb-8">
        Mentions légales
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">Éditeur du site</h2>
        <p className="text-foreground leading-relaxed">
          <strong>Naya SAS</strong>
          <br />
          Société par actions simplifiée au capital de 1 000 €<br />
          Siège social : [adresse à compléter], Paris, France
          <br />
          SIRET : [numéro à compléter]
          <br />
          RCS Paris : [numéro à compléter]
          <br />
          Directeur de la publication : [nom à compléter]
          <br />
          Contact :{" "}
          <a href="mailto:contact@naya.app" className="text-sage hover:underline">
            contact@naya.app
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">Hébergement</h2>
        <p className="text-foreground leading-relaxed">
          <strong>Vercel Inc.</strong>
          <br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
          <br />
          Site web :{" "}
          <a
            href="https://vercel.com"
            className="text-sage hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            vercel.com
          </a>
        </p>
        <p className="text-foreground leading-relaxed mt-4">
          <strong>Supabase Inc.</strong> (base de données — hébergement EU)
          <br />
          970 Toa Payoh North, Singapour (données stockées en Europe — Frankfurt,
          Allemagne)
          <br />
          Site web :{" "}
          <a
            href="https://supabase.com"
            className="text-sage hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            supabase.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">Propriété intellectuelle</h2>
        <p className="text-foreground leading-relaxed">
          L&apos;ensemble du contenu de ce site (textes, images, interface, code) est la
          propriété exclusive de Naya SAS et est protégé par les lois françaises et
          internationales relatives à la propriété intellectuelle. Toute reproduction,
          même partielle, est interdite sans autorisation écrite préalable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          Limitation de responsabilité
        </h2>
        <p className="text-foreground leading-relaxed">
          Naya SAS s&apos;efforce de maintenir les informations publiées sur ce site à
          jour. Toutefois, la société ne peut garantir l&apos;exactitude, la complétude ou
          l&apos;actualité des informations. L&apos;utilisation des informations et
          contenus disponibles sur ce site est faite sous l&apos;entière responsabilité de
          l&apos;utilisateur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">Contact</h2>
        <p className="text-foreground leading-relaxed">
          Pour toute question relative au présent site, vous pouvez nous contacter à :{" "}
          <a href="mailto:contact@naya.app" className="text-sage hover:underline">
            contact@naya.app
          </a>
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-12">
        Dernière mise à jour : mai 2026
      </p>
    </article>
  );
}
