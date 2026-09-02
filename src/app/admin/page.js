import AdminAuth from "@/app/components/AdminAuth/AdminAuth";

export const metadata = {
  title: "Admin Portal | Store",
  description: "Secure admin login and registration portal",
};

export default function AdminPage() {
  return (
    <main className="w-full min-h-screen bg-neutral-50 flex items-center justify-center">
      <AdminAuth />
    </main>
  );
}