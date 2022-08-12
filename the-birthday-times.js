#!/usr/bin/env node

const needle = require('needle')
const dayjs = require('dayjs')
const prompts = require('prompts')
const dedent = require('dedent')
const color = require('ansi-colors')

async function main () {
  showTitle()
  const news = await getNews(await getBirthday())
  loadingMessage()
  displayNews(news)
}

function showTitle () {
  const title = dedent`:￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣:
    :                                                                      :
    :              🗞   ${color.bold('T h e   B i r t h d a y   T i m e s 🗞')}               :
    :                                                                      :
    :                                                                      :
     ￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣￣`
  console.log('\n' + title + '\n\n')
}

async function getBirthday () {
  const question = [
    {
      type: 'date',
      name: 'birthday',
      message: '🎂 Your Birthday?',
      mask: ('YYYY-MM-DD'),
      validate: date => date > dayjs()
        ? 'Not in the future'
        : true &&
          date < dayjs('1981/1/1')
          ? 'Not before 1981'
          : true
    }
  ]
  const response = await prompts(question)
  const birthday = dayjs(response.birthday).add(1, 'month')
  return birthday
}

async function getNews (birthday) {
  checkApiKey()
  const birthYear = (birthday.$y)
  const birthMonth = (birthday.$M)
  const birthDate = (birthday.$D)
  const response = await needle('get', `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=pub_date:(${birthYear}-${birthMonth}-${birthDate})&api-key=${process.env.NYTIMES_KEY}`)
  if (response) {
    return response
  } else {
    throw new Error('The API key is incorrect. Please check it again.'
    )
  }
}

function checkApiKey () {
  try {
    if (!process.env.NYTIMES_KEY) {
      throw new Error(color.red("Please set your API key on your operating system.\nTo set environment variables on macOS or Linux, run the export command from the terminal: export NYTIMES_KEY='YOUR-API-KEY'\n"))
    }
  } catch (error) {
    console.log(error.message)
  }
}

function loadingMessage () {
  process.stdout.write('\n\n\n                 .')
  for (let index = 0; index <= 3; index++) {
    blockTime(700)
    process.stdout.write('.')
  }
  console.log(' Now going back to your birthday' + '\n\n\n')
  blockTime(1200)
}

function blockTime (timeout) {
  const startTime = Date.now()
  while (true) {
    const diffTime = Date.now() - startTime
    if (diffTime >= timeout) {
      return
    }
  }
}

function displayNews (news) {
  const newsIndexNum = getNewsIndexNum(news)
  try {
    for (let index = 0; index < newsIndexNum.length; index++) {
      console.log('🔎 ' + color.bold.green.underline(news.body.response.docs[newsIndexNum[index]].headline.main + '\n'))
      console.log(news.body.response.docs[newsIndexNum[index]].lead_paragraph + '\n\n\n')
    }
  } catch (error) {
    console.log('🔎 ' + color.bold.red.underline('Sorry...the article cannot be found.\n\n\n\n'))
  }
}

function getNewsIndexNum (response) {
  const articleNum = response.body.response.docs.length
  const newsIndexNum = []
  while (newsIndexNum.length <= 2) {
    const index = Math.floor(Math.random() * articleNum)
    if (newsIndexNum[0] !== index && newsIndexNum[newsIndexNum.length - 1] !== index) {
      newsIndexNum.push(index)
    }
  }
  return newsIndexNum
}

main()
