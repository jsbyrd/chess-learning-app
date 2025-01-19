import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/components/UserProvider/use-user-hook";
import customAxios from "@/api/custom-axios";
import { AxiosError } from "axios";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const { toast } = useToast();
  const { handleLogin } = useUser();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRepeatPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDisabled(true);

    try {
      // Verify password
      if (password !== repeatPassword) {
        toast({
          title: "Error: Passwords do not match",
          description:
            "Please ensure that your passwords match before trying again.",
          variant: "destructive",
        });
        return;
      }
      // Make account
      const data = {
        email: email,
        password: password,
      };
      await customAxios.post("/auth/register", data);
      handleLogin(email);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: `Error Code ${error.status} (${error.response?.data?.error})`,
          description: `${
            error.response?.data?.message ??
            "Something went wrong, please try again later."
          }`,
          variant: "destructive",
        });
      }
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={handleEmailChange}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  value={password}
                  onChange={handlePasswordChange}
                  minLength={3} // TODO: Remove magic number
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Re-enter Password</Label>
                </div>
                <Input
                  value={repeatPassword}
                  onChange={handleRepeatPasswordChange}
                  id="repeat-password"
                  type="password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isDisabled}
              >
                Create Account
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
