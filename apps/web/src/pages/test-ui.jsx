// Simple test component to verify UI is working
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Alert } from "../components/ui/interactive.jsx";

export default function TestUI() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">UI Test Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Button Variants Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="warning">Warning Button</Button>
              <Button variant="danger">Danger Button</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge Variants Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Variants Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default">
              This is a default alert message.
            </Alert>
            <Alert variant="primary">
              This is a primary alert message.
            </Alert>
            <Alert variant="success">
              This is a success alert message.
            </Alert>
            <Alert variant="warning">
              This is a warning alert message.
            </Alert>
            <Alert variant="error">
              This is an error alert message.
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-primary-500 text-white p-4 rounded">Primary 500</div>
              <div className="bg-secondary-500 text-white p-4 rounded">Secondary 500</div>
              <div className="bg-success-500 text-white p-4 rounded">Success 500</div>
              <div className="bg-warning-500 text-white p-4 rounded">Warning 500</div>
              <div className="bg-error-500 text-white p-4 rounded">Error 500</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
