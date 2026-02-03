curl -X POST http://hostclick.am/api/v1/webhooks/suspend \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "example.yourdomain.com"
  }'
