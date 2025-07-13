import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('households')
      .select('*')
      .limit(1);

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    return (
      <div>
        <h1>Connection successful!</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  } catch (err) {
    return <div>Connection failed: {err.message}</div>;
  }
}
