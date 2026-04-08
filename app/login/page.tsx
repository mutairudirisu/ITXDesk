import Image from "next/image";

import LoginForm from "../_components/auth/LoginForm";
import itxDesk from "@/public/ITXDesk.svg"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3ff] via-white to-white dark:bg-[#0b0f14] dark:bg-none">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center gap-6 bg-[#0074de] text-white px-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
              <Image width={34} height={34} src={itxDesk} alt="ITXDesk" priority />
            </div>
            <div>
              <div className="text-2xl font-semibold leading-tight">ITX Helpdesk</div>
              <div className="text-sm text-white/85">Ticket logging and helpdesk requests</div>
            </div>
          </div>
          <div className="max-w-md text-white/90">
            Sign in to manage tickets, track progress, and keep your support workflow organized.
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="h-10 w-10 rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 flex items-center justify-center">
                <Image width={26} height={26} src={itxDesk} alt="ITXDesk" priority />
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">ITX Helpdesk</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Sign in to continue</div>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur dark:bg-zinc-950/60">
              <CardHeader className="space-y-1">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your email and password to sign in.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
