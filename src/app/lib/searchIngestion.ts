// lib/searchIngestion.ts
export async function searchIngestion(items: any[]) {
    for (const item of items) {
      const document = {
        document: {
          id: item.id,
          fields: {
            name: item.name,
            description: item.Description?.jsonValue?.value || '', // Default to empty if not present
            type: 'content',
            url: `https://www.sitecoredemo.com/${item.path}`, // Assuming a base URL with path
            image_url: '', // Assuming no image URL; you can replace if available
          }
        }
      };
  
      // Call the PUT request for each document
      await updateSearchDocument(item.id, document);
    }
  }
  
  async function updateSearchDocument(id: string, document: any) {
    const baseUrl = process.env.SEARCH_BASE_URL;  // Assume base URL is from .env.local
    const apiKey = process.env.SEARCH_API_KEY;    // API key for search environment
  
    const url = `${baseUrl}/${id}?locale=en_us`;
  
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${apiKey}`,
      },
      body: JSON.stringify(document),
    });
  
    if (!response.ok) {
      console.error(`Error updating document ${id}:`, await response.text());
      throw new Error(`Failed PUT request for document ${id}`);
    }
  
    console.log(`Document ${id} successfully updated.`);
  }
  