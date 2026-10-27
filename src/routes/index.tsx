import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, Users, Hexagon, MessagesSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/demo-notice";
import heroIllustration from "@/assets/hero-illustration.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Co-Parent — A calm parenting companion",
      },
      {
        name: "description",
        content:
          "Co-Parent helps you understand your family through Human Design and reflects with you through a warm AI companion. A portfolio demo.",
      },
      {
        property: "og:title",
        content: "Co-Parent — A calm parenting companion",
      },
      {
        property: "og:description",
        content:
          "Family profiles, Human Design charts, and an AI companion for thoughtful parenting conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Your family, understood",
    body: "Keep a gentle profile for yourself and each child — names, birthdays, birthplaces — all private to your account.",
  },
  {
    icon: Hexagon,
    title: "Human Design, softly presented",
    body: "See each family member's chart laid out clearly, with room to reflect on what the design says about how they move through the world.",
  },
  {
    icon: MessagesSquare,
    title: "A companion to think with",
    body: "Talk through bedtime struggles, big feelings, or sibling friction. The companion reflects on your family's profiles with you.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Co-Parent</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 pb-16">
        <section className="grid items-center gap-10 py-8 md:grid-cols-2 md:py-14">
          <div>
            <p className="text-sm font-medium text-primary">A portfolio demo</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Parent with more calm — and more you.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Co-Parent is a reflective companion for families: profiles for you and your
              children, Human Design charts presented clearly, and an AI companion to think
              things through with.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create your account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">
                  Sign in
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Charts and AI replies in this demo use clearly labelled sample data. No external
              integrations are live yet.
            </p>
          </div>
          <div className="order-first md:order-none">
            <img
              src={heroIllustration}
              alt="An illustration of a parent and child reading together in warm, sage-green tones"
              className="w-full rounded-xl border border-border"
            />
          </div>
        </section>

        <section className="grid gap-4 py-6 sm:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-border bg-card p-6">
              <feature.icon className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">
              What's inside the demo
            </h2>
            <DemoBadge />
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>Sign up and sign in with your own account</li>
            <li>Add yourself and your children as family profiles</li>
            <li>View a clearly labelled sample Human Design chart</li>
            <li>Chat with a demo-mode AI companion that saves your conversations</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Sample profiles are fictional. Nothing here provides medical or psychological advice.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <p className="mx-auto max-w-5xl px-5 text-xs text-muted-foreground">
          Co-Parent — a portfolio demo. Built with care, not for clinical use.
        </p>
      </footer>
    </div>
  );
}
