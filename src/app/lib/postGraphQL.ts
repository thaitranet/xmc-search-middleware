// lib/postGraphQL.ts
export async function postGraphQL(ids: string[]) {
    if (ids.length === 0) return [];
  
    const graphqlQuery = {
      query: `
        query {
          search(where: {
            AND: [
              {
                OR: [
                  ${ids.map(id => `{ name: "_path", value: "${id}", operator: CONTAINS }`).join('\n')}
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
  
    // 🔥 Filter: only keep results where id is exactly in the input ids
    const filteredResults = allResults.filter((item: any) =>
      ids.includes(item.id)
    );

    console.log(JSON.stringify(allResults), ids)
  
    console.log('Filtered GraphQL Results:', filteredResults.length);
    return filteredResults;
  }
  