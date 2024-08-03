import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import logInImage from '@/assets/login-image.jpg'
import LoginForm from "./LoginForm"
import GoogleSignInButton from "../GoogleSignInButton"

export const metadata:Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = () => {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="shadow-2xl flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card">
        <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Sign Up to bugbook</h1>
            <p className="text-muted-foreground">A place where even <span className="italic text-emerald-500">you</span> can find a friend</p>
          </div>
          <div className="space-y-5">
            <GoogleSignInButton />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted"/>
              <span>or</span>
              <div className="h-px flex-1 bg-muted"/>
            </div>
            <LoginForm />
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
        <Image
          className="w-1/2 hidden md:block object-cover"
          alt=""
          src={logInImage}
        />
      </div>
    </main>
  )
}

export default LoginPage