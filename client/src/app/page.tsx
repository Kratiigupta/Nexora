import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b">
        <Link href="/" className="text-xl font-bold text-primary">
          Nexora
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
            Register
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Connect. Collaborate. Build.
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mb-8">
          The smart student collaboration platform. Find teammates, exchange skills, and build amazing projects together.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/register" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Login
          </Link>
        </div>
      </main>
      
      <footer className="py-6 w-full text-center border-t">
        <p className="text-sm text-muted-foreground">
          © 2026 Nexora. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
