'use strict';

const fs = require('fs');
const epithets = fs.readFileSync('./epithets_f.txt').toString().split('\n');

const Telegraf   = require('telegraf');
const seedrandom = require('seedrandom');

const token      = process.env.TOKEN;
const port       = process.env.PORT || 3000;
const host       = process.env.HOST;
const bot        = new Telegraf(token);
bot.command('start',   ctx => ctx.reply('Напиши мне /kakaya чтобы узнать, какая ты сегодня xaota.'));
bot.command('kakaya',  current);
bot.command('history', history);
bot.telegram.getMe().then(botInfo => bot.options.username = botInfo.username);
bot.startPolling();

function current(ctx) {
  const user    = ctx.message.from.id;
  const chat    = ctx.message.chat.id;
  const message = ctx.message.message_id;
  const today   = processRequest(user, chat, 0);
  ctx.reply(today, {reply_to_message_id: message});
}

function history(ctx) {
  const user    = ctx.message.from.id;
  const chat    = ctx.message.chat.id;
  const message = ctx.message.message_id;
  const days    = Array.from({length: 7}, (_, i) => processRequest(user, chat, -i));
  ctx.reply(days.join('\n'), {reply_to_message_id: message});
}

function processRequest(user, chat, offset = 0) {
  const date = getDate(offset);
  const rand = getRandom(user, chat, date);
  const before = getMoment(offset, date);
  const after = 'xaota!';
  const middle = getEpithets(rand);
  const result = [before, middle, after].join(' ');
  return result;
}

function getEpithets(rand) {
  return shuffle(epithets.slice(), rand).slice(0, random(4, rand) + 1).join(' ');
}

function getMoment(offset, date) {
  const days = [
    'Сегодня',
    'Вчера',
    'Позавчера',
    dayOfWeek(date, -3 - offset), // 3 дня назад
    dayOfWeek(date, -4 - offset), // 4 дня назад
    dayOfWeek(date, -5 - offset), // 5 дней назад
    'Неделю назад'
  ].map((d, i) => i === 0 ? d + ' ты' : d + ' ты была');
  return days[-offset];
}

function dayOfWeek(origin, offset) {
  const days = [
    "В воскресенье",
    "В понедельник",
    "Во вторник",
    "В среду",
    "В четверг",
    "В пятницу",
    "В субботу"
  ];
  const date = new Date(origin);
  date.setDate(date.getDate() + offset);
  return days[date.getDay()];
}

function getDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
}

function getRandom(user, chat, date) {
  const seed = `${chat}:${user}:${date.getFullYear()}.${date.getMonth()}.${date.getDate()}`;
  return seedrandom(seed);
}

/** Замес массива
  * @param {array} array целевой массив
  */
  function shuffle(array, rand) {
    for (let i = array.length - 1; i > 0; --i) {
      const j = random(i + 1, rand);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

/** Случайка в [0, max)
  * @param {number} max верхний предел
  * @return {number} что-то
  */
  function random(max, rand = Math.random) {
    return Math.floor(rand() * max);
  }

bot.telegram.getMe().then(botInfo => {
  bot.options.username = botInfo.username;
})

bot.telegram.setWebhook(`${host}/bot${token}`)
  .then(() => bot.startWebhook(`/bot${token}`, null, port));
