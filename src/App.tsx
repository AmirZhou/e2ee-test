import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { SecureFiles } from "./SecureFiles";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-legal-navy text-white h-16 flex justify-between items-center shadow-lg px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-legal-gold rounded flex items-center justify-center">
            <span className="text-legal-navy font-bold text-sm">AAL</span>
          </div>
          <h2 className="text-xl font-semibold">Access Alberta Legal</h2>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <footer className="bg-legal-navy text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">
            © 2024 Access Alberta Legal. All rights reserved. | 
            <span className="ml-2">Secure • Confidential • Professional</span>
          </p>
          <p className="text-xs text-gray-300 mt-2">
            End-to-end encrypted document storage for legal professionals
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Secure Document Portal</h1>
        <p className="text-lg text-gray-600 mb-2">Access Alberta Legal</p>
        <Authenticated>
          <p className="text-lg text-secondary">
            Welcome back, {loggedInUser?.email ?? "friend"}! Your legal documents are encrypted client-side for maximum security.
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-lg text-secondary">Sign in to access your secure legal documents</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <SecureFiles />
      </Authenticated>
    </div>
  );
}
