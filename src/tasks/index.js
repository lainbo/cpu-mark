import puppeteer from 'puppeteer'
import fs from 'fs'
import { uniqBy, orderBy } from 'lodash-es'
import chalk from 'chalk'

const OUTPUT_PATH = './src/assets/staticData'

const proxyInfo = {
  url: 'http://127.0.0.1',
  port: '43998',
  userName: 'admin',
  password: '389wMknr44vWYEG6XU',
}

const sites = [
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-multi-core',
    code: () => {
      const name = Array.from(
        document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]')
      ).map(i => i.innerText)
      const mark = Array.from(
        document.querySelectorAll('span.ml-2.text-slate-900.text-sm.font-semibold')
      ).map(i => i.innerText)
      return { name, mark }
    },
    fileName: 'gb6MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-single-core',
    code: () => {
      const name = Array.from(
        document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]')
      ).map(i => i.innerText)
      const mark = Array.from(
        document.querySelectorAll('span.ml-2.text-slate-900.text-sm.font-semibold')
      ).map(i => i.innerText)
      return { name, mark }
    },
    fileName: 'gb6SData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-multi-core',
    code: () => {
      const name = Array.from(
        document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]')
      ).map(i => i.innerText)
      const mark = Array.from(
        document.querySelectorAll('span.ml-2.text-slate-900.text-sm.font-semibold')
      ).map(i => i.innerText)
      return { name, mark }
    },
    fileName: 'r23MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-single-core',
    code: () => {
      const name = Array.from(
        document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]')
      ).map(i => i.innerText)
      const mark = Array.from(
        document.querySelectorAll('span.ml-2.text-slate-900.text-sm.font-semibold')
      ).map(i => i.innerText)
      return { name, mark }
    },
    fileName: 'r23SData',
  },
  {
    url: 'https://www.topcpu.net/soc-r',
    code: () => {
      const name = Array.from(
        document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]')
      ).map(i => i.innerText)
      const mark = Array.from(
        document.querySelectorAll('span.ml-2.text-slate-900.text-sm.font-semibold')
      ).map(i => i.innerText)
      return { name, mark }
    },
    fileName: 'socData',
  },
  {
    url: 'https://www.videocardbenchmark.net/gpu_list.php',
    code: () => {
      const name = Array.from(document.querySelectorAll('tr[id^=gpu]')).map(
        i => i.children[0].textContent
      )
      const mark = Array.from(document.querySelectorAll('tr[id^=gpu]')).map(
        i => i.children[1].textContent
      )
      return { name, mark }
    },
    fileName: 'gpuData',
  },
  {
    url: 'https://www.harddrivebenchmark.net/hdd_list.php',
    code: () => {
      const name = Array.from(document.querySelectorAll('tr.even, tr.odd')).map(
        i => i.childNodes[0].childNodes[0].textContent
      )
      const mark = Array.from(document.querySelectorAll('tr.even, tr.odd')).map(
        i => i.childNodes[2].childNodes[0].textContent
      )
      return { name, mark }
    },
    fileName: 'hardDriveData',
  },
]

async function fetchData(site) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [`--proxy-server=${proxyInfo.url}:${proxyInfo.port}`],
  })
  const page = await browser.newPage()

  await page.authenticate({
    username: proxyInfo.userName || '',
    password: proxyInfo.password || '',
  })

  await page.goto(site.url, { timeout: 60000 })

  const data = await page.evaluate(site.code)

  await browser.close()

  return data
}

async function run() {
  const startTime = Date.now()

  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  for (const site of sites) {
    try {
      const data = await fetchData(site)

      const result = []
      for (let i = 0; i < data.name.length; i++) {
        result.push({
          nameDetail: data.name[i],
          mark: Number(data.mark[i].replace(/,/g, '')),
        })
      }

      const uniqueResult = uniqBy(result, 'nameDetail')
      const sortedResult = orderBy(uniqueResult, ['mark'], ['desc'])

      fs.writeFileSync(
        `${OUTPUT_PATH}/${site.fileName}.json`,
        JSON.stringify(sortedResult, null, 2)
      )
      console.log(`${chalk.greenBright('成功:')}`, `${site.fileName}.json`)
    } catch (error) {
      console.error(chalk.red(`错误：${error.message}`))
    }
  }
  const endTime = Date.now()
  const elapsedSeconds = (endTime - startTime) / 1000
  console.log(chalk.bgGreen(`耗时: ${elapsedSeconds.toFixed(2)}秒数据拉取完毕`))
}

run()
