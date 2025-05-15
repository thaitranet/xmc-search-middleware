// lib/searchIngestion.ts

export async function searchIngestion(items: any[]) {
  const baseUrl = process.env.SEARCH_BASE_URL;
  const apiKey = process.env.SEARCH_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error('SEARCH_BASE_URL or SEARCH_API_KEY is not defined in environment variables.');
  }

  for (const item of items) {
    const url = `${baseUrl}/${item.id}?locale=en_us`;

    if (item.operation === 'delete') {
      await deleteSearchDocument(item.id, url, apiKey);
    } else if (item.operation === 'update') {
      const document = {
        document: {
          id: item.id,
          fields: {
            name: item.name,
            description: item.Description?.jsonValue?.value || '',
            type: 'content',
            url: `https://www.sitecoredemo.com/${item.path}`,
            image_url: '',
          }
        }
      };

      await updateSearchDocument(item.id, url, apiKey, document);
    } else {
      console.warn(`Unknown operation "${item.operation}" for item ${item.id}`);
    }
  }
}

async function updateSearchDocument(id: string, url: string, apiKey: string, document: any) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    console.error(`Error updating document ${id}:`, await response.text());
    throw new Error(`Failed PUT request for document ${id}`);
  }

  console.log(`Document ${id} successfully updated.`);
}

async function deleteSearchDocument(id: string, url: string, apiKey: string) {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': apiKey,
    },
  });

  if (!response.ok) {
    console.error(`Error deleting document ${id}:`, await response.text());
    throw new Error(`Failed DELETE request for document ${id}`);
  }

  console.log(`Document ${id} successfully deleted.`);
}
