import { Button } from "../components/ui/button";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50/50">
            <div className="flex max-w-[400px] flex-col items-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <span className="text-4xl font-bold text-red-600">403</span>
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Access Denied
                    </h1>
                    <p className="text-gray-500">
                        You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
                    </p>
                </div>

                <Button 
                    variant="default" 
                    className="mt-4 gap-2"
                    onClick={() => navigate("/")}
                >
                    <MoveLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
}
