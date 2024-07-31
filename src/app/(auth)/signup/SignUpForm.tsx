'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signUpSchema, SignUpVaues } from "@/lib/validation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"
import { signUp } from "./actions"
import { PasswordInput } from "@/components/PasswordInput"
import LoadingButton from "@/components/LoadingButtons"

const SignUpForm = () => {
  const [error, setError] = useState<string>('')
  const [isPending,startTransition] = useTransition()

  const form = useForm<SignUpVaues>({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:'',
      email:'',
      password:'',
    }
  })

  async function onSubmit(values:SignUpVaues){
    setError('')
    startTransition(async() => {
      const {error} = await signUp(values)
      if(error) setError(error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="username"
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  placeholder="Username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <PasswordInput
                  id="password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-center text-destructive">{error}</p>}
        <LoadingButton
          loading={isPending}
          type="submit"
          className="w-full"
        >Create account</LoadingButton>
      </form>
    </Form>
  )
}

export default SignUpForm