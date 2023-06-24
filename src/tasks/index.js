import puppeteer from 'puppeteer'
import fs from 'fs'
import { uniqBy, orderBy } from 'lodash-es'
import chalk from 'chalk'

const OUTPUT_PATH = './src/assets/staticData'

const sites = [
  {
    url: 'https://www.cpubenchmark.net/cpu_list.php',
    code: () => {
      const name = Array.from(document.querySelectorAll('tr[id^=cpu][class]')).map(
        i => i.childNodes[0].childNodes[0].textContent
      )
      const mark = Array.from(document.querySelectorAll('tr[id^=cpu][class]')).map(
        i => i.childNodes[1].childNodes[0].textContent
      )
      return { name, mark }
    },
    fileName: 'cpuMData',
  },
  {
    url: 'https://www.cpubenchmark.net/top-gaming-cpus.html',
    code: () => {
      const name = Array.from(document.querySelectorAll('.prdname')).map(
        i => i.textContent
      )
      const mark = Array.from(document.querySelectorAll('.count')).map(i => i.textContent)
      return { name, mark }
    },
    fileName: 'cpuSData',
  },
  {
    url: 'https://www.videocardbenchmark.net/directCompute.html',
    code: () => {
      const name = Array.from(document.querySelectorAll('li[id^=rk]')).map(
        i => i.children[1].children[0].textContent
      )
      const mark = Array.from(document.querySelectorAll('li[id^=rk]')).map(
        i => i.childNodes[3].childNodes[5].textContent
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
    args: ['--proxy-server=http://127.0.0.1:7890'],
  })
  const page = await browser.newPage()

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
