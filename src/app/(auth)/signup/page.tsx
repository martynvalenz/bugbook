import { Metadata } from "next"
import signUpImage from '@/assets/signup-image.jpg'
import Image from "next/image"
import Link from "next/link"
import SignUpForm from "./SignUpForm"

export const metadata:Metadata = {
  title:'Sign Up',
  description:'Sign up for an account'
}

const SignUpPage = () => {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="shadow-2xl flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card">
        <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign Up to bugbook</h1>
            <p className="text-muted-foreground">A place where even <span className="italic text-emerald-500">you</span> can find a friend</p>
          </div>
          <div className="space-y-5">
            <SignUpForm />
            <Link href="/login" className="block text-center hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
        <Image
          className="w-1/2 hidden md:block object-cover"
          alt=""
          src={signUpImage}
        />
      </div>
    </main>
  )
}

export default SignUpPage