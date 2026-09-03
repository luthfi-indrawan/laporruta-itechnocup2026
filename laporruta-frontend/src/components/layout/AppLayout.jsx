import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
