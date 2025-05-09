# 🔍 Sitecore XM Cloud to Search: Incremental Update Middleware

This project is a **complimentary implementation** to the official Sitecore Cookbook recipe:  
[Search Incremental Updates on Sitecore XM Cloud](https://developers.sitecore.com/learn/accelerate/xm-cloud/implementation/sitecore-search/search-incremental-updates)

## 🚀 Purpose

The goal is to accelerate developer implementation by providing a working example for sending **incremental content updates** from **Sitecore XM Cloud** to **Sitecore Search**.  
The codebase is written in **TypeScript**, built with **Next.js**, and is fully customizable.

## ⚙️ Key Features

1. **Webhook (Batch)**  
   - Receives `OnUpdate` events from **Sitecore Experience Edge**
   - Filters layout-specific item identifiers
   - Groups updates using **Upstash KV** under unique `invocation_id` keys
   - Sets **TTL** for automatic cleanup

2. **Webhook (Rebuild)**  
   - Triggered after publishing is complete (`OnEnd`)
   - Processes items from the queue
   - Queries content using **Experience Edge GraphQL**
   - Extracts and validates data
   - Transforms and sends documents to **Sitecore Search Ingestion API**

## 🧠 How It Works

When content is published in XM Cloud:

1. It is first published to **Experience Edge**.
2. This triggers a webhook (`batch`) to store relevant item updates in Upstash.
3. After publishing is completed, a second webhook (`rebuild`) processes those items.
4. The final output is a near real-time update of content in **Sitecore Search**, without waiting for scheduled crawler jobs.

## 📦 Benefits

- Real-time content sync to Sitecore Search
- Fully serverless deployment (via Vercel)
- Easy to extend and integrate with custom logic or data sources