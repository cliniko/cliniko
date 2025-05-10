import { DocsSidebar } from '@/components/ui/docs-sidebar';
import { useParams } from 'react-router-dom';

export default function Documentation() {
  const params = useParams();
  const componentName = params.component;
  
  // Demo data
  const organization = {
    name: 'Acme Inc',
    description: 'Enterprise',
  };

  const user = {
    name: 'shadcn',
    email: 'm@example.com',
  };

  return (
    <div className="flex h-svh">
      <DocsSidebar organization={organization} user={user} />
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl">
          {componentName ? (
            <ComponentDocumentation componentName={componentName} />
          ) : (
            <DefaultDocumentation />
          )}
        </div>
      </main>
    </div>
  );
}

function DefaultDocumentation() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Welcome to the documentation for Acme Inc. This showcases our new 
        docs sidebar using Tailwind v4 and React 19 features.
      </p>
      
      <div className="mt-8 grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p className="mt-2 text-muted-foreground">
            Learn the basics of using our platform and components.
          </p>
        </div>
        
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Components</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of UI components for building applications.
          </p>
        </div>
        
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">API Reference</h2>
          <p className="mt-2 text-muted-foreground">
            Detailed documentation for all available APIs.
          </p>
        </div>
      </div>
    </>
  );
}

function ComponentDocumentation({ componentName }: { componentName: string }) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight capitalize">{componentName}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Documentation for the {componentName} component.
      </p>
      
      <div className="mt-8 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="rounded-lg bg-zinc-950 p-4 text-white overflow-auto">
            <pre>
              <code>{`import { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} } from '@/components/ui/${componentName}';

export default function Demo() {
  return (
    <${componentName.charAt(0).toUpperCase() + componentName.slice(1)}>
      // Component usage
    </${componentName.charAt(0).toUpperCase() + componentName.slice(1)}>
  );
}`}</code>
            </pre>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Examples</h2>
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground">
              Example implementations for the {componentName} component.
            </p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">API Reference</h2>
          <div className="rounded-lg border p-6">
            <p className="text-muted-foreground">
              API documentation for the {componentName} component.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 