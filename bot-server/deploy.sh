#!/bin/bash
# Deploy bot.server para cloudhost.run.place
# Requisitos: docker, acesso SSH ao servidor

SERVER="root@bot.cloudhost.run.place"
REMOTE_DIR="/opt/pulse-fit-bot"

echo "📦 Deployando bot server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"
scp -r index.js package.json Dockerfile .env $SERVER:$REMOTE_DIR/
ssh $SERVER "cd $REMOTE_DIR && docker build -t pulse-fit-bot . && docker stop pulse-fit-bot 2>/dev/null; docker rm pulse-fit-bot 2>/dev/null; docker run -d --name pulse-fit-bot --restart unless-stopped -p 3000:3000 --env-file .env pulse-fit-bot"
echo "✅ Deploy concluído!"
curl -s https://bot.cloudhost.run.place/health | python3 -m json.tool
