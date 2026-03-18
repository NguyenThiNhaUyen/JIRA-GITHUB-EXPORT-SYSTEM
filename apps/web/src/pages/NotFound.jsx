// Not Found Page - 404 error page
import { Button } from "@/components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Trang khĂ´ng tĂ¬m tháº¥y</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Trang báº¡n Ä‘ang tĂ¬m kiáº¿m khĂ´ng tá»“n táº¡i hoáº·c Ä‘Ă£ Ä‘Æ°á»£c di chuyá»ƒn.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              Quay láº¡i
            </Button>
            <Button onClick={() => navigate("/")}>
              Vá» trang chá»§
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Náº¿u báº¡n nghÄ© Ä‘Ă¢y lĂ  lá»—i, vui lĂ²ng liĂªn há»‡ quáº£n trá»‹ viĂªn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

