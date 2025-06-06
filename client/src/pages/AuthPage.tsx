import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, LogIn, Trophy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, isLoading, loginUser, registerUser } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    const user = await loginUser(data.username, data.password);
    if (user) {
      setLocation("/");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const user = await registerUser(data.username, data.email, data.password);
    if (user) {
      setLocation("/");
    }
  };

  return (
    <div className="container grid flex-1 h-screen items-center justify-center md:grid-cols-2 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-purple-800 via-blue-700 to-cyan-600 p-10 text-white dark:border-r lg:flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-blue-700 to-cyan-600 bg-opacity-90">
          {/* Decorative elements for multicolor effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-green-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="h-full w-full p-10 flex flex-col justify-between">
            <div className="flex items-center text-lg font-medium">
              {/* App name removed as it appears in the header */}
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400">
                Welcome
              </h1>
              <p className="text-lg text-gray-300">
                Track, enter, and win competitions across the web. 
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="mr-2 text-pink-400 font-bold">✓</span> Discover new competitions daily
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-yellow-300 font-bold">✓</span> Track your entry progress 
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-400 font-bold">✓</span> Manage your wins and prizes
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-cyan-400 font-bold">✓</span> See your ranking on leaderboards
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-400">
              &copy; Blue Whale Competitions {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" 
                ? "Enter your credentials to sign in to your account" 
                : "Fill in your details to create a new account"}
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 border border-gray-200 bg-gray-100 p-0.5">
              <TabsTrigger value="login" className="font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="register" className="font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl flex items-center">
                    <LogIn className="mr-2 h-5 w-5" /> Sign in
                  </CardTitle>
                  <CardDescription>
                    Enter your username and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your_username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium shadow-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex items-center justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Register
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl flex items-center">
                    <UserPlus className="mr-2 h-5 w-5" /> Create account
                  </CardTitle>
                  <CardDescription>
                    Create a new account to start tracking competitions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your_username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium shadow-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex items-center justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Log in
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}