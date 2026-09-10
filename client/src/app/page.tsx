import Link from "next/link";
import {
  Sparkles,
  Users,
  FolderKanban,
  Globe,
  CalendarDays,
  ArrowLeftRight,
  MessageCircle,
  UserCircle,
  Search,
  Lightbulb,
  Handshake,
  Rocket,
  ArrowRight,
  Code,
  Palette,
  Brain,
  BarChart3,
  Send,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

/* ─────────────────────────────────────────────
   Static data
   ───────────────────────────────────────────── */

const valueItems = [
  { icon: Search, label: "Find Teammates" },
  { icon: Lightbulb, label: "Share Skills" },
  { icon: Handshake, label: "Collaborate" },
  { icon: Rocket, label: "Discover Opportunities" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Skill Matching",
    description:
      "Get matched with students whose skills and interests complement yours using intelligent recommendations.",
  },
  {
    icon: Users,
    title: "Find Teammates",
    description:
      "Discover students from across campuses who are looking to build the same things you are.",
  },
  {
    icon: FolderKanban,
    title: "Team & Project Workspace",
    description:
      "Organize your team, track tasks, and collaborate on projects in a shared workspace.",
  },
  {
    icon: Globe,
    title: "Communities",
    description:
      "Join communities around shared interests, technologies, and goals to learn and grow together.",
  },
  {
    icon: CalendarDays,
    title: "Events",
    description:
      "Discover hackathons, workshops, meetups, and other events to participate and showcase your work.",
  },
  {
    icon: ArrowLeftRight,
    title: "Skill Exchange",
    description:
      "Offer your expertise and learn new skills from peers through structured skill exchanges.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Messaging",
    description:
      "Stay connected with teammates through instant messaging, team chats, and project discussions.",
  },
  {
    icon: UserCircle,
    title: "Student Profiles",
    description:
      "Showcase your skills, projects, experience, and what you want to build to attract collaborators.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create Your Profile",
    description:
      "Showcase your skills, interests, experience, and what you want to build. Let others know what makes you a great collaborator.",
  },
  {
    num: "02",
    title: "Discover the Right People",
    description:
      "Find students whose skills and interests complement yours. Browse profiles, teams, projects, and communities.",
  },
  {
    num: "03",
    title: "Collaborate & Grow",
    description:
      "Build projects, join communities, exchange skills, and grow together. Turn ideas into reality with the right team.",
  },
];

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Global background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--primary)_0%,transparent_50%)] opacity-[0.07]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.6_0.2_300)_0%,transparent_50%)] opacity-[0.05]" />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <LandingNav />

      <main>
        {/* ════════════════════════════════════
           HERO
           ════════════════════════════════════ */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-48 lg:pb-32">
          {/* Hero aurora orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-primary/15 blur-[140px] animate-pulse-glow" />
            <div className="absolute top-48 -left-24 h-[320px] w-[320px] rounded-full bg-purple-500/10 blur-[120px] animate-float-delayed" />
            <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-blue-500/8 blur-[100px] animate-float-slow" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left — Copy */}
              <AnimatedSection className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Campus collaboration, reimagined
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                  <span className="bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                    Find the right people.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Build something meaningful.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg lg:text-xl mx-auto lg:mx-0">
                  Nexora connects students across campuses to discover teammates,
                  exchange skills, and collaborate on projects that matter. Your
                  next great team is waiting.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30 px-8 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-muted/50 hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Explore Nexora
                  </Link>
                </div>
              </AnimatedSection>

              {/* Right — Mock Dashboard Card */}
              <AnimatedSection delay={0.2} className="hidden lg:block">
                <div className="relative">
                  {/* Glow behind card */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent blur-2xl opacity-60" />

                  <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/20">
                    {/* Card header bar */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-3 w-3 rounded-full bg-destructive/60" />
                      <div className="h-3 w-3 rounded-full bg-warning/60" />
                      <div className="h-3 w-3 rounded-full bg-success/60" />
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        nexora / dashboard
                      </span>
                    </div>

                    {/* Mock profile row */}
                    <div className="flex items-center gap-4 mb-5 rounded-xl border border-border/30 bg-muted/20 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-sm font-bold text-white">
                        AK
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">Arjun Kumar</p>
                        <p className="text-xs text-muted-foreground">Full-Stack Developer · CS, 3rd Year</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-success">
                        <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        Online
                      </div>
                    </div>

                    {/* Mock skills */}
                    <div className="mb-5">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {["React", "Node.js", "Python", "Figma", "TypeScript"].map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Mock match cards */}
                    <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Matches</p>
                    <div className="space-y-2">
                      {[
                        { initials: "SP", name: "Sara Patel", role: "UI/UX Designer", match: "92%" },
                        { initials: "RJ", name: "Rohan Joshi", role: "ML Engineer", match: "87%" },
                      ].map((person) => (
                        <div
                          key={person.name}
                          className="flex items-center gap-3 rounded-lg border border-border/20 bg-muted/10 p-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-purple-400/60 text-xs font-bold text-white">
                            {person.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                            <p className="text-xs text-muted-foreground">{person.role}</p>
                          </div>
                          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                            {person.match}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
           VALUE STRIP
           ════════════════════════════════════ */}
        <section className="relative border-y border-border/30 bg-muted/10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
            <AnimatedSection>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                {valueItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ════════════════════════════════════
           FEATURES
           ════════════════════════════════════ */}
        <section id="features" className="relative py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-semibold tracking-wider text-primary uppercase mb-3">
                Features
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to collaborate
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
                From discovering the perfect teammate to managing projects and
                exchanging skills — Nexora has you covered.
              </p>
            </AnimatedSection>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={i * 0.06}>
                  <div className="group relative rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
           HOW IT WORKS
           ════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="relative py-24 md:py-32 border-t border-border/30"
        >
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-primary/5 blur-[160px]" />

          <div className="relative mx-auto max-w-7xl px-6">
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-semibold tracking-wider text-primary uppercase mb-3">
                How It Works
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps to your next great team
              </h2>
            </AnimatedSection>

            <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
              {/* Connecting line (desktop) */}
              <div className="pointer-events-none absolute top-16 left-[16.66%] right-[16.66%] hidden md:block">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {steps.map((step, i) => (
                <AnimatedSection key={step.num} delay={i * 0.15}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Step number */}
                    <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-lg font-bold text-primary shadow-lg shadow-primary/10">
                      {step.num}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
           PLATFORM SHOWCASE
           ════════════════════════════════════ */}
        <section className="relative py-24 md:py-32 border-t border-border/30">
          <div className="mx-auto max-w-7xl px-6">
            <AnimatedSection className="text-center mb-16">
              <p className="text-sm font-semibold tracking-wider text-primary uppercase mb-3">
                The Nexora Experience
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for how students actually collaborate
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
                A glimpse into the tools and features that make Nexora your
                go-to collaboration platform.
              </p>
            </AnimatedSection>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 — Profile */}
              <AnimatedSection delay={0}>
                <div className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                    <UserCircle className="h-4 w-4 text-primary" />
                    Student Profile
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-500 text-xs font-bold text-white">
                      MR
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Meera Rao</p>
                      <p className="text-xs text-muted-foreground">Data Science · 2nd Year</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["Python", "TensorFlow", "SQL"].map((s) => (
                      <span key={s} className="rounded-full bg-primary/5 border border-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Looking for a frontend developer to team up for a health-tech hackathon this semester.
                  </p>
                </div>
              </AnimatedSection>

              {/* Card 2 — Discovery */}
              <AnimatedSection delay={0.08}>
                <div className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                    <Search className="h-4 w-4 text-primary" />
                    Teammate Discovery
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { initials: "AK", name: "Arjun K.", skill: "React · Next.js", match: "94%" },
                      { initials: "NV", name: "Neha V.", skill: "UI/UX Design", match: "89%" },
                      { initials: "DM", name: "Dev M.", skill: "Cloud · DevOps", match: "85%" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center gap-3 rounded-lg bg-muted/15 border border-border/20 p-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/50 to-purple-400/50 text-[10px] font-bold text-white">
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.skill}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-success">{p.match}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Card 3 — Project Workspace */}
              <AnimatedSection delay={0.16}>
                <div className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    Project Workspace
                  </div>
                  <div className="rounded-lg bg-muted/15 border border-border/20 p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-3.5 w-3.5 text-primary" />
                      <p className="text-sm font-semibold text-foreground">EcoTrack</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Carbon footprint tracker for campus communities</p>
                    <div className="flex gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 4 members</span>
                      <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> 12 tasks</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-md bg-success/10 border border-success/15 px-2 py-1.5 text-center">
                      <p className="text-[11px] font-semibold text-success">5</p>
                      <p className="text-[10px] text-muted-foreground">Done</p>
                    </div>
                    <div className="flex-1 rounded-md bg-primary/10 border border-primary/15 px-2 py-1.5 text-center">
                      <p className="text-[11px] font-semibold text-primary">4</p>
                      <p className="text-[10px] text-muted-foreground">In Progress</p>
                    </div>
                    <div className="flex-1 rounded-md bg-muted/30 border border-border/20 px-2 py-1.5 text-center">
                      <p className="text-[11px] font-semibold text-muted-foreground">3</p>
                      <p className="text-[10px] text-muted-foreground">To Do</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Card 4 — Messaging */}
              <AnimatedSection delay={0.08}>
                <div className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Real-time Messaging
                  </div>
                  <div className="space-y-3">
                    {/* Incoming */}
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/50 to-purple-400/50 text-[10px] font-bold text-white">
                        SP
                      </div>
                      <div className="rounded-xl rounded-tl-sm bg-muted/30 border border-border/20 px-3 py-2 max-w-[200px]">
                        <p className="text-xs text-foreground">Hey! I saw your profile — love your React work. Want to team up for HackFest?</p>
                        <p className="text-[10px] text-muted-foreground mt-1">2:34 PM</p>
                      </div>
                    </div>
                    {/* Outgoing */}
                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="rounded-xl rounded-tr-sm bg-primary/15 border border-primary/20 px-3 py-2 max-w-[200px]">
                        <p className="text-xs text-foreground">Absolutely! Let&apos;s set up a call this week 🚀</p>
                        <p className="text-[10px] text-muted-foreground mt-1">2:36 PM</p>
                      </div>
                    </div>
                    {/* Input mock */}
                    <div className="flex items-center gap-2 rounded-lg bg-muted/15 border border-border/20 px-3 py-2">
                      <p className="flex-1 text-xs text-muted-foreground">Type a message...</p>
                      <Send className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Card 5 — Events */}
              <AnimatedSection delay={0.16}>
                <div className="group rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Upcoming Events
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        title: "HackFest 2026",
                        type: "Hackathon",
                        date: "Oct 15–17",
                        location: "Virtual + Hybrid",
                        icon: Rocket,
                        color: "text-primary",
                      },
                      {
                        title: "Design Systems Workshop",
                        type: "Workshop",
                        date: "Oct 22",
                        location: "Campus Hub",
                        icon: Palette,
                        color: "text-purple-400",
                      },
                      {
                        title: "AI/ML Study Group",
                        type: "Community",
                        date: "Every Thursday",
                        location: "Online",
                        icon: Brain,
                        color: "text-success",
                      },
                      {
                        title: "Startup Pitch Night",
                        type: "Event",
                        date: "Nov 5",
                        location: "Innovation Center",
                        icon: Star,
                        color: "text-warning",
                      },
                    ].map((event) => (
                      <div
                        key={event.title}
                        className="flex items-start gap-3 rounded-lg bg-muted/15 border border-border/20 p-3"
                      >
                        <div className={`mt-0.5 ${event.color}`}>
                          <event.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
                          <p className="text-[11px] text-muted-foreground">{event.type}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.date}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
           COMMUNITY / ABOUT
           ════════════════════════════════════ */}
        <section
          id="about"
          className="relative py-24 md:py-32 border-t border-border/30"
        >
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[160px]" />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <AnimatedSection>
                <p className="text-sm font-semibold tracking-wider text-primary uppercase mb-3">
                  About Nexora
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Collaboration without boundaries
                </h2>
                <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                  <p>
                    Your next great teammate shouldn&apos;t be limited to who
                    sits next to you in class. Nexora breaks down campus walls so
                    students from any college, any department, can find each
                    other and build together.
                  </p>
                  <p>
                    Whether you&apos;re a designer looking for developers, an
                    engineer searching for a research partner, or someone with an
                    idea looking for a team — Nexora makes those connections
                    happen naturally.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Globe,
                      title: "Cross-Campus",
                      desc: "Connect with students from any college or university.",
                    },
                    {
                      icon: Sparkles,
                      title: "Skill Discovery",
                      desc: "Find people with complementary skills and shared goals.",
                    },
                    {
                      icon: FolderKanban,
                      title: "Project Partners",
                      desc: "Team up for hackathons, research, and passion projects.",
                    },
                    {
                      icon: Users,
                      title: "Communities",
                      desc: "Join groups around shared interests to learn and grow.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm"
                    >
                      <item.icon className="h-5 w-5 text-primary mb-3" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
           FINAL CTA
           ════════════════════════════════════ */}
        <section className="relative py-24 md:py-32 border-t border-border/30">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-primary/10 blur-[180px] animate-pulse-glow" />
          </div>

          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <AnimatedSection>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Ready to find your people?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
                Join Nexora and start discovering teammates, exchanging skills,
                and building projects that matter. Your next collaboration starts
                here.
              </p>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-10 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* ════════════════════════════════════
         FOOTER
         ════════════════════════════════════ */}
      <footer className="border-t border-border/30 bg-muted/5">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
                  Nexora
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                The smart student collaboration platform. Discover teammates,
                exchange skills, and build meaningful projects together — across
                campuses.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Platform
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "About", href: "#about" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auth */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Get Started
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Nexora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
