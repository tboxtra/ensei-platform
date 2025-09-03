import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { PLATFORM_TASKS } from '@ensei/shared-types';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// Basic command handlers
bot.command('start', (ctx) => {
    ctx.reply('Welcome to Ensei Platform! 🚀\n\nUse /help to see available commands.');
});

bot.command('help', (ctx) => {
    const helpText = `
🤖 Ensei Platform Bot Commands:

📋 /missions - View available missions
🎯 /create - Create a new mission
💰 /wallet - Check your wallet balance
📊 /stats - View your mission statistics
❓ /help - Show this help message

For more information, visit: https://ensei.com
  `;
    ctx.reply(helpText);
});

bot.command('missions', (ctx) => {
    ctx.reply('🔍 Fetching available missions...\n\nThis feature is coming soon!');
});

bot.command('create', (ctx) => {
    ctx.reply('🚀 Mission creation coming soon!\n\nYou\'ll be able to create missions directly from Telegram.');
});

bot.command('wallet', (ctx) => {
    ctx.reply('💰 Wallet integration coming soon!\n\nCheck your balance and transactions here.');
});

bot.command('stats', (ctx) => {
    ctx.reply('📊 Statistics coming soon!\n\nTrack your mission performance and earnings.');
});

// Handle text messages
bot.on('text', (ctx) => {
    ctx.reply('I\'m here to help! Use /help to see available commands.');
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
    ctx.reply('Sorry, something went wrong. Please try again later.');
});

// Start the bot
bot.launch()
    .then(() => {
        console.log('🤖 Ensei Telegram Bot is running...');
    })
    .catch((err) => {
        console.error('Failed to start bot:', err);
    });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
