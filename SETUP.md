# 🚀 Deploy to Vercel

Deploy the project to Vercel by running the following command in your terminal:

```bash
vercel --prod
```

---

# 🔐 Environment Variables

Set the following environment variables in Vercel:

```env
KV_URL=
KV_REST_API_READ_ONLY_TOKEN=
REDIS_URL=
KV_REST_API_TOKEN=
KV_REST_API_URL=
SC_API_KEY=
SEARCH_BASE_URL=
SEARCH_API_KEY=
```

## 🔑 How to Obtain These Variables

1. **SC_API_KEY**  
   Generate a Delivery API token by following this guide:  
   [Set up the Delivery API Playground](https://doc.sitecore.com/xmc/en/developers/xm-cloud/set-up-the-graphql-playgrounds-to-test-published-content.html#set-up-the-delivery-api-playground)

2. **SEARCH_BASE_URL**  
   Format:  
   ```
   https://discover.sitecorecloud.io/ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/documents
   ```  
   Get `{domain}`, `{source}`, and `{entity}` from Search CEC:  
   [Publish the Source](https://doc.sitecore.com/search/en/users/search-user-guide/configure-api-push.html#publish-the-source)

3. **SEARCH_API_KEY**  
   Obtain it from Sitecore CEC:  
   [API Authentication & Authorization](https://doc.sitecore.com/search/en/developers/search-developer-guide/api-authentication-and-authorization.html#api-key)

4. **Upstash for Redis**  
   Install from the Vercel Marketplace:  
   [Upstash Redis on Vercel](https://vercel.com/marketplace/upstash)  
   Follow the wizard and copy the following values into your environment variables:
   ```
   KV_URL
   KV_REST_API_READ_ONLY_TOKEN
   REDIS_URL
   KV_REST_API_TOKEN
   KV_REST_API_URL
   ```

After setting the environment variables, **redeploy the middleware** to apply changes.

---

# 🔁 Create Webhooks

Use **Postman** to create and test webhooks.

## 1. Get JWT Token

```bash
curl --location 'https://auth.sitecorecloud.io/oauth/token' \
--header 'content-type: application/x-www-form-urlencoded' \
--data-urlencode 'audience=https://api.sitecorecloud.io' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=*********************' \
--data-urlencode 'client_secret=*********************'
```

Refer to this guide to obtain `client_id` and `client_secret`:  
[Manage Client Credentials](https://doc.sitecore.com/xmc/en/developers/xm-cloud/manage-client-credentials-for-an-xm-cloud-organization-or-environment.html#create-an-automation-client-for-an-xm-cloud-environment)

**Tip:** Use a Postman script to persist the JWT as a variable:

```js
// Postman Test Script
var accessToken = pm.response.json().access_token;
pm.collectionVariables.set("JWT", accessToken);
```

---

## 2. Batch Webhook (OnUpdate)

Receives `OnUpdate` events from Experience Edge, filters them, and queues items in Upstash.

```bash
curl --location 'https://edge.sitecorecloud.io/api/admin/v1/webhooks' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{JWT}}' \
--data '{
  "label": "XM Cloud to Experience Edge - OnUpdate",
  "uri": "https://{your-vercel-domain}.vercel.app/api/events/batch",
  "method": "POST",
  "headers": {
    "x-header": "bar"
  },
  "createdBy": "you",
  "executionMode": "OnUpdate"
}'
```

---

## 3. Rebuild Webhook (OnEnd)

Triggered on `OnEnd`, reads from the queue, queries Experience Edge, transforms data, and ingests into Search.

```bash
curl --location 'https://edge.sitecorecloud.io/api/admin/v1/webhooks' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{JWT}}' \
--data '{
  "label": "XM Cloud to Experience Edge - OnEnd",
  "uri": "https://{your-vercel-domain}.vercel.app/api/events/rebuild",
  "method": "POST",
  "headers": {
    "x-header": "bar"
  },
  "body": "{\"rebuild\":\"true\"}",
  "createdBy": "you",
  "executionMode": "OnEnd"
}'
```

---

## Notes for Both Webhooks

- In Postman Auth tab, set **Auth Type** to **Bearer Token**
- Set the **Token** to `{{JWT}}`
- Replace `{your-vercel-domain}` accordingly

---

# 🧪 Testing

1. Open [Vercel Logs (Live Mode)](https://vercel.com/{your-vercel-team-id}/middleware/logs)
2. Publish a document in XM Cloud
3. Monitor request logs in Vercel
4. Confirm the document is indexed in Sitecore Search

---

# 🔧 Customization

### Modify GraphQL Query
`src/app/lib/postGraphQL.ts`  
- Change search parameters  
- Add or remove fields

### Modify Search Document Transformation
`src/app/lib/searchIngestion.ts`  
- Customize document transformation  
- Generate custom document ID  
- Pull data from external sources

---

# 🛠️ Troubleshooting

- Use Postman to test webhook endpoints, GraphQL queries, Search ingestion requests, etc.
- Check Vercel logs for runtime errors
- See invocation updates in the Upstash KV console: [Upstash Vercel KV Console](https://console.upstash.com/vercel/kv)
- Get all Experience Edge webhooks and check the `lastRuns`:

```
curl --location 'https://edge.sitecorecloud.io/api/admin/v1/webhooks' \
--header 'Authorization: Bearer {{JWT}}'
```

```
[
    {
        "id": "**********",
        "tenantId": "**********",
        "label": "XM Cloud to Experience Edge - OnUpdate",
        "uri": "https://**********.vercel.app/api/events/batch",
        "method": "POST",
        "headers": {
            "x-header": "bar"
        },
        "body": "",
        "createdBy": "thai",
        "created": "2025-04-30T03:30:15.0603968+00:00",
        "bodyInclude": null,
        "executionMode": "OnUpdate",
        "lastRuns": [
            {
                "timestamp": "2025-04-30T04:52:39.8220885+00:00",
                "success": true
            },
            {
                "timestamp": "2025-04-30T04:49:08.6115837+00:00",
                "success": true
            }
        ],
        "disabled": null
    },
    {
        "id": "**********",
        "tenantId": "**********",
        "label": "XM Cloud to Experience Edge - OnEnd",
        "uri": "https://**********.vercel.app/api/events/rebuild",
        "method": "POST",
        "headers": {
            "x-header": "bar"
        },
        "body": "{\"rebuild\":\"true\"}",
        "createdBy": "thai",
        "created": "2025-04-30T04:46:52.5919994+00:00",
        "bodyInclude": null,
        "executionMode": "OnEnd",
        "lastRuns": [
            {
                "timestamp": "2025-04-30T04:52:41.6682895+00:00",
                "success": true
            },
            {
                "timestamp": "2025-04-30T04:49:11.0817171+00:00",
                "success": true
            }
        ],
        "disabled": null
    }
]
```

- For local development, copy environment variables to `.env.local` and run:

```bash
npm run dev
```

---

# 📝 Additional Notes

- **Upstash Redis Queue TTL:** 1 day  
  You can modify TTL in:  
  `src/app/api/events/batch/route.ts`