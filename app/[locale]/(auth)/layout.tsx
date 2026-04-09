export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-stone-900">{"Archer's Mind"}</h1>
        <p className="text-sm text-stone-500">Antrenorul tău mental</p>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
