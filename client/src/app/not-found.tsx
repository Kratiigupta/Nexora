import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Search className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed, renamed, or doesn&apos;t exist.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/dashboard">
          <Button className="w-full sm:w-auto gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/discover/students">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Search className="h-4 w-4" />
            Discover
          </Button>
        </Link>
      </div>
    </div>
  );
}
