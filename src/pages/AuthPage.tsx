
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const AuthPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Sign in to access your workouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Authentication is currently disabled in this demo version.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to="/workouts">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Link to="/workouts">
            <Button>Continue as Guest</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
