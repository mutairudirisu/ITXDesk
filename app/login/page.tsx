import Image from "next/image";

import LoginForm from "../_components/auth/LoginForm";
import itxDesk from "@/public/ITXDesk.svg"


export default function LoginPage() {
  return (
    <div className="flex h-screen">
        <div className="flex justify-center gap-2 items-center bg-blue-600 text-white text-2xl h-screen w-full">
            <Image width={110} height={110} src={itxDesk} alt="ITXDesk" priority />
            <h1 className="font-semibold">ITX Helpdesk</h1>
        </div>
        <div className="flex flex-col gap-10 items-center justify-center px-[150px]">
            {/* <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div> */}
            <div className="space-y-2">
                <Image width={110} height={110} src={itxDesk} alt="ITXDesk" priority />
                <h1 className="font-semibold">ITX Helpdesk</h1>
            </div>
            <LoginForm />
        </div>
    </div>
    // <div className="flex h-screen">
    //     <div className="flex justify-center gap-2 items-center bg-blue-500 text-white text-2xl h-screen w-full">
    //         <Image width={100} height={100} src={meediator} alt="meediator" className="text-white" />
    //         <h1 className="font-medium">MeediatorHR</h1>
    //     </div>
    // <div className="w-full max-w-md mx-auto p-6 space-y-6">
    //   <div className="text-center space-y-2">
    //     <h1 className="text-2xl font-bold">Welcome Back</h1>
    //     <p className="text-muted-foreground">Sign in to your account to continue</p>
    //   </div>
      
    //   <Tabs defaultValue="login" className="w-full">
    //     <TabsList className="grid w-full grid-cols-2">
    //       <TabsTrigger value="login">Login</TabsTrigger>
    //       <TabsTrigger value="register">Register</TabsTrigger>
    //     </TabsList>
    //     <TabsContent value="login">
    //       <div className="space-y-4 pt-4">
    //         <LoginForm />
    //       </div>
    //     </TabsContent>
    //     {/* <TabsContent value="register">
    //       <div className="space-y-4 pt-4">
    //         <SignUpForm />
    //       </div>
    //     </TabsContent> */}
    //   </Tabs>
    // </div>
    // </div>
  );
}
