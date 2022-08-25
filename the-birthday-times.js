#!/usr/bin/env node

const needle = require('needle')
const dayjs = require('dayjs')
const prompts = require('prompts')
const dedent = require('dedent')
const color = require('ansi-colors')
const { setTimeout } = require('timers/promises')

async function main () {
  try {
    ensureApiKey()
    showTitle()
    const birthday = await getBirthday()
    const news = await getNews(birthday)
    await showLoadingMessage()
    displayNews(news)
  } catch (error) {
    console.log(error.message)
  }
}

function ensureApiKey () {
  if (!process.env.NYTIMES_KEY) {
    throw new Error(color.red("Please set your API key on your operating system.\nTo set environment variables on macOS or Linux, run the export command from the terminal: export NYTIMES_KEY='YOUR-API-KEY'"))
  }
}

function showTitle () {
  const title = dedent`
    :￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣:
    :                                                                      :
    :              ${color.bold('🗞   T h e   B i r t h d a y   T i m e s   🗞')}             :
    :                                                                      :
    :                                                                      :
    ￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣
  `
  console.log('\n' + title + '\n\n')
}

async function getBirthday () {
  const question = [
    {
      type: 'date',
      name: 'birthday',
      message: '🎂 Your Birthday?',
      mask: ('YYYY-MM-DD'),
      validate:
        date => {
          if (date > dayjs()) {
            return 'Not in the future'
          }
          if (date < dayjs('1981/1/1')) {
            return 'Not before 1981'
          }
          return date
        }
    }
  ]
  const answer = await prompts(question)
  return dayjs(answer.birthday).add(1, 'month')
}

async function showLoadingMessage () {
  process.stdout.write('\n\n\n                 .')
  for (let index = 0; index <= 3; index++) {
    await setTimeout(700)
    process.stdout.write('.')
  }
  console.log(' Now going back to your birthday\n\n\n')
  await setTimeout(1000)
}

async function getNews (birthday) {
  const response = await needle('get', `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=pub_date:(${birthday.$y}-${birthday.$M}-${birthday.$D})&api-key=${process.env.NYTIMES_KEY}`)
  if (response) {
    return response
  } else {
    throw new Error('The API key is incorrect. Please check it again.')
  }
}

function displayNews (news) {
  const newsIndexNum = getNewsIndexNum(news)
  try {
    for (let index = 0; index < newsIndexNum.length; index++) {
      console.log(`🔎  ${color.bold.green.underline(news.body.response.docs[newsIndexNum[index]].headline.main)}\n\n` +
      `${news.body.response.docs[newsIndexNum[index]].lead_paragraph}\n\n\n`)
    }
  } catch (error) {
    console.error(error.message)
  }
}

function getNewsIndexNum (news) {
  const articleNum = news.body.response.docs.length
  const newsIndexNum = []
  while (newsIndexNum.length <= 2) {
    const index = Math.floor(Math.random() * articleNum)
    if (newsIndexNum[0] !== index &&
      newsIndexNum[newsIndexNum.length - 1] !== index) {
      newsIndexNum.push(index)
    }
  }
  return newsIndexNum
}

main()
