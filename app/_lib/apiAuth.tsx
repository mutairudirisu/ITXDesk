'use server'

import { redirect } from "next/navigation";
import { supabase } from "./supabase";

export const signIn = async (email: string, password: string) => {

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });


    if(error) {
      throw new Error(error.message);
    } 

    //after successful sign in, redirect to dashboard
    if (data.user) {
      redirect('/dashboard')
    }

    // return data;
        
}
export const getUser = async () => {
  const {data: session } = await supabase.auth.getSession();

  if (!session.session) return null;

  const {data, error} = await supabase.auth.getUser();

  if (error) throw new Error(error.message)

  return data?.user;
}

