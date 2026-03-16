import { Button } from "../../components/ui/button.jsx";

export default function ProjectDetail() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Detail (Deprecated)</h2>
        <p className="text-gray-500 mb-4">This page has been replaced by Group Detail.</p>
        <Button onClick={() => window.history.back()}>Quay lại</Button>
      </div>
    </div>
  );
}
