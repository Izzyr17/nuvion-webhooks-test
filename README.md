# test-server

Simple Express server exposing POST /api/webhooks/nuv

Quick start:

```bash
cd /path/to/test-server
npm install
npm start
```

Test the webhook endpoint:

```bash
curl -X POST http://localhost:3000/api/webhooks/nuv -H "Content-Type: application/json" -d '{"hello":"world"}'
```
