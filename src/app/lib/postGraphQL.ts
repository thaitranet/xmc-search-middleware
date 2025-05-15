// lib/postGraphQL.ts
export async function postGraphQL(operations: { id: string, operation: 'update' | 'delete' }[]) {
  if (operations.length === 0) return [];

  const updates = operations.filter(op => op.operation === 'update');
  const deletes = operations.filter(op => op.operation === 'delete');

  let filteredResults: any[] = [];

  if (updates.length > 0) {
    const graphqlQuery = {
      query: `
        query {
          search(where: {
            AND: [
              {
                OR: [
                  ${updates.map(({ id }) => `{ name: "_path", value: "${id}", operator: CONTAINS }`).join('\n')}
                ]
              },
              { name: "_language", value: "en" },
              { name: "_hasLayout", value: "true" }
            ]
          }) {
            total
            results {
              id
              name
              path
              language { name }
              Name: field(name: "Title") { jsonValue }
              Description: field(name: "Content") { jsonValue }
            }
          }
        }
      `
    };

    const response = await fetch('https://edge.sitecorecloud.io/api/graphql/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sc_apikey': process.env.SC_API_KEY!,
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      console.error('GraphQL query failed:', await response.text());
      throw new Error('Failed GraphQL request');
    }

    const data = await response.json();
    const allResults = data?.data?.search?.results || [];

    // Filter: only keep results where id matches
    filteredResults = allResults
      .filter((item: any) => updates.some(u => u.id === item.id))
      .map((item: any) => ({
        ...item,
        operation: 'update',
      }));
  }

  // Add delete operations with only id and operation
  const deleteResults = deletes.map(d => ({
    id: d.id,
    operation: 'delete',
  }));

  const finalResults = [...filteredResults, ...deleteResults];

  console.log('GraphQL Results:', finalResults.length);
  return finalResults;
}
