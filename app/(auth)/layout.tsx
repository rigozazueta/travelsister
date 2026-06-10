import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="texture-grain flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-md px-5 py-6">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-16">{children}</main>
    </div>
  );
}
