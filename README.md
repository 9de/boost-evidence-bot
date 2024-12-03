# 🔍 Boost Evidence Collector

A powerful Discord bot designed to help server administrators collect, manage, and track evidence of boosters from BlocksMC & MarsMC servers. Features an intuitive command system and MongoDB integration for reliable data storage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)
![Node](https://img.shields.io/badge/node-v16.9.0+-green.svg)

## 📋 Features

- **Evidence Management**
  - Add evidence with usernames and URLs
  - Remove evidence (Staff only)
  - Search by username
  - List all evidence
  - View evidence by Discord user
  
- **User-Friendly Interface**
  - Beautiful embeds
  - Interactive pagination
  - Quick copy functionality
  - Search filtering
  
- **Security**
  - Role-based permissions
  - Command logging
  - Audit trail
  - Error handling

## 🚀 Setup Guide

### Prerequisites
1. [Node.js](https://nodejs.org/) (v16.9.0 or higher)
2. [MongoDB Atlas](https://www.mongodb.com/atlas/database) Account (Free)
3. [Discord Developer Account](https://discord.com/developers/applications)

### Bot Creation
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your bot and create it
4. Go to "Bot" section
   - Click "Add Bot"
   - Enable all Privileged Gateway Intents
   - Save Changes
5. Copy your bot token

### Installation
```bash
# Clone repository
git clone https://github.com/9de/boost-evidence-bot.git

# Install dependencies
npm install

# Deploy commands
npm run deploy

# Start bot
npm start
```

### Configuration
Create a `.env` file in the root directory:
```env
DISCORD_TOKEN=your_bot_token
MONGODB_URI=your_mongodb_url
CLIENT_ID=your_client_id
GUILD_ID=your_server_id
STAFF_ROLE_ID=role_id_for_staff
LOG_CHANNEL_ID=channel_id_for_logs
```

## 💡 Commands

### Evidence Management
- `/evidence add <username> <url>`
  - Add new evidence to database
  - Available to all users
  - Requires valid URL

- `/evidence remove <id>`
  - Remove evidence from database
  - Staff only
  - Requires evidence ID

- `/evidence list`
  - View all evidence with pagination
  - Staff only
  - Shows 5 entries per page

- `/evidence search <username>`
  - Search evidence by Minecraft username
  - Staff only
  - Case insensitive search

- `/evidence user <@user>`
  - View evidence added by specific Discord user
  - Staff only
  - Shows submission history

### Administrative
- `/echo <message> <channel> [reply_to]`
  - Send messages through bot
  - Admin only
  - Optional reply functionality

## 🛡️ Permission Setup

### Bot Permissions
Required permissions:
- Send Messages
- Embed Links
- Read Message History
- Use Slash Commands

### Role Setup
1. Create Staff role
2. Copy role ID
3. Add to `.env` file
4. Assign role to trusted members

## 📊 Logging System

The bot logs all actions to specified channel:
- Evidence additions
- Evidence removals
- Command usage
- Errors

## ⚙️ Technical Details

- Built with Discord.js v14
- MongoDB for data storage
- Modular command structure
- Error handling & logging
- Interactive components

## 🐛 Troubleshooting

Common issues and solutions:
1. Bot not responding
   - Check bot token
   - Verify permissions
   - Check Node.js version

2. Database errors
   - Verify MongoDB URI
   - Check database access
   - Check network connection

3. Command deployment issues
   - Verify client and guild IDs
   - Run deploy script again
   - Check command permissions

## 📞 Support

Need help? Contact:
- Discord: 50y
- Issues: GitHub Issues tab

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Submit pull request

## 🙏 Credits

- Built with [Discord.js](https://discord.js.org/)
- Database: [MongoDB](https://www.mongodb.com/)
- Developer: Turki
