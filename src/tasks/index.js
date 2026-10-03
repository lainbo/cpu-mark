import puppeteer from 'puppeteer'
import fs from 'fs'
import { uniqBy, orderBy } from 'lodash-es'
import chalk from 'chalk'

const OUTPUT_PATH = './src/assets/staticData'
const TIMEOUT = 30000

// topcpu 的各个排行页结构相同：每行一个 CPU 链接，同一行里的加粗 span 是分数
const topCpu = {
  waitFor: 'a.hover\\:no-underline[href^="/cpu/"]',
  code: () =>
    Array.from(document.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]'), a => ({
      name: a.textContent,
      mark: a.parentElement.querySelector('span.mx-2.text-slate-900.text-sm.font-bold')
        ?.textContent,
    })),
}

// Geekbench 官方处理器榜单里没有苹果芯片，苹果芯片的成绩在 Mac 榜单里按机型列出。
// 两个页面的单核、多核成绩分别在 id 为 single-core、multi-core 的标签页里
const geekbenchCpu = {
  urls: [
    'https://browser.geekbench.com/processor-benchmarks',
    'https://browser.geekbench.com/mac-benchmarks',
  ],
  viaFirecrawl: true,
  code: tab =>
    Array.from(document.querySelectorAll(`#${tab} tbody tr`), tr => {
      const name = tr.querySelector('td.name a')?.textContent
      // Mac 榜单的名称是机型，把 description 里的芯片和核心数接在机型后面，去掉频率
      const chip =
        tr.closest('#mac') &&
        tr.querySelector('td.name .description')?.textContent.replace(/@ [\d.]+ GHz/, '')
      return {
        name: chip ? `${name} ${chip}` : name,
        mark: tr.querySelector('td.score')?.textContent,
      }
    }),
}

const sites = [
  {
    ...geekbenchCpu,
    tab: 'multi-core',
    fileName: 'gbMData',
  },
  {
    ...geekbenchCpu,
    tab: 'single-core',
    fileName: 'gbSData',
  },
  {
    urls: ['https://www.topcpu.net/cpu-r/cinebench-r23-multi-core'],
    ...topCpu,
    fileName: 'r23MData',
  },
  {
    urls: ['https://www.topcpu.net/cpu-r/cinebench-r23-single-core'],
    ...topCpu,
    fileName: 'r23SData',
  },
  {
    // 安卓芯片取自 SoC 天梯的手机芯片（level=1），苹果芯片不在天梯里，取自按机型列出的 iOS 性能榜
    urls: [
      'https://www.antutu.com/ranking/soc?level=1',
      'https://www.antutu.com/ranking/ios',
    ],
    waitFor: '.nrank-b .model-name',
    // 两个榜单每行的第 2、3 个 li 分别是 CPU、GPU 得分
    code: () =>
      Array.from(document.querySelectorAll('.nrank-b'), row => {
        const [, cpu, gpu] = row.querySelectorAll('li')
        const name = row.querySelector('.model-name')?.textContent
        // iOS 性能榜括号里是芯片和内存容量，如 "(A19 Pro 12+256)"，只把芯片接在机型后面
        const chip =
          location.pathname === '/ranking/ios' &&
          row.querySelector('.memory')?.textContent.replace(/^\(|(\s*\d+\+\d+)?\)$/g, '')
        return {
          name: chip ? `${name} ${chip}` : name,
          mark: cpu?.textContent,
          gpu: gpu?.textContent,
        }
      }),
    fileName: 'socData',
  },
  {
    urls: ['https://browser.geekbench.com/opencl-benchmarks'],
    // Geekbench 会对 GitHub Actions 的请求弹出 Cloudflare 人机验证，页面改由 Firecrawl 抓取
    viaFirecrawl: true,
    // 名称单元格里还有一个 description 子元素，只取它前面的文本
    code: () =>
      Array.from(document.querySelectorAll('#opencl tbody tr'), tr => ({
        name: tr.querySelector('td.name')?.firstChild?.textContent,
        mark: tr.querySelector('td.score')?.textContent,
      })),
    // 名称符合以下任一规则的条目不收录
    exclude: [
      // Linux 开源驱动 Mesa 的条目，分数随驱动版本大幅波动。名称带驱动和内核版本，
      // 如 "(radeonsi, gfx1201, ACO, DRM 3.64, 6.18.20)"，或以 Mesa、zink 开头，或标注 Panfrost、RADV
      /, DRM \d|^Mesa |^zink |\(Panfrost\)|\(RADV /,
      // 芯片代号后列出多款型号，分数对应不到具体型号，如 "Navi 21 [Radeon RX 6800/6800 XT / 6900 XT]"
      /\[[^\]]*\/[^\]]*\]/,
      // 只有 PCI 设备编号、没有型号，如 "Intel(R) Graphics [0x56a0]"
      /^Intel\(R\) (Graphics( Gen\w+)?|Arc\(TM\)) \[/,
    ],
    fileName: 'gpuData',
  },
  {
    urls: [
      'https://www.ssd-tester.com/m2_ssd_test.php',
      'https://www.ssd-tester.com/sata_ssd_test.php',
    ],
    // 全部数据已在 HTML 中，禁用脚本以免前端分页只留下当前页的行。
    disableJavaScript: true,
    waitFor: '#table tbody tr',
    code: () =>
      Array.from(document.querySelectorAll('#table tbody tr'), tr => ({
        name: tr.children[0]?.querySelector('a')?.textContent,
        readSpeed: tr.children[3]?.textContent.replace('MB/s', ''),
        writeSpeed: tr.children[4]?.textContent.replace('MB/s', ''),
        mark: tr.children[5]?.textContent,
      })),
    fileName: 'ssdData',
  },
]

// 单核和多核来自同一个页面，同一次运行里每个页面只请求一次
const firecrawlPages = new Map()

async function firecrawl(url) {
  if (firecrawlPages.has(url)) {
    return firecrawlPages.get(url)
  }
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    // Firecrawl 默认会返回 2 天内缓存的页面，这里只接受 1 小时内的
    body: JSON.stringify({ url, formats: ['rawHtml'], maxAge: 3600000 }),
    signal: AbortSignal.timeout(TIMEOUT),
  })
  const { success, error, data } = await res.json()
  if (!success) {
    throw new Error(`Firecrawl 抓取失败，${error}`)
  }
  firecrawlPages.set(url, data.rawHtml)
  return data.rawHtml
}

async function fetchData(browser, site) {
  const rows = []
  for (const url of site.urls) {
    const page = await browser.newPage()
    try {
      if (site.disableJavaScript || site.viaFirecrawl) {
        await page.setJavaScriptEnabled(false)
      }
      if (site.viaFirecrawl) {
        // 只需要解析 HTML，不执行页面里的广告和统计脚本
        await page.setContent(await firecrawl(url), { waitUntil: 'domcontentloaded' })
      } else {
        // 数据都在 HTML 里，DOM 解析完即可读取，不等广告和统计脚本加载
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
        await page.waitForSelector(site.waitFor, { timeout: TIMEOUT })
      }
      const pageRows = await page.evaluate(site.code, site.tab)
      // 由多个页面合并的数据，任一页面解析不到数据都不更新，避免缺掉一部分
      if (!pageRows.length) {
        throw new Error(`${url} 中没有解析到数据`)
      }
      rows.push(...pageRows)
    } finally {
      await page.close()
    }
  }
  return rows
}

function toNumber(text) {
  return Number(text.replace(/,/g, '').trim())
}

function save(site, data) {
  const result = data
    .map(({ name = '', mark = '', gpu, readSpeed, writeSpeed }) => ({
      nameDetail: name.replace(/\s+/g, ' ').trim(),
      mark: toNumber(mark),
      ...(gpu !== undefined && { gpu: toNumber(gpu) }),
      ...(readSpeed !== undefined && { readSpeed: toNumber(readSpeed) }),
      ...(writeSpeed !== undefined && { writeSpeed: toNumber(writeSpeed) }),
    }))
    .filter(
      item =>
        item.nameDetail &&
        Number.isFinite(item.mark) &&
        !Number.isNaN(item.gpu) &&
        !Number.isNaN(item.readSpeed) &&
        !Number.isNaN(item.writeSpeed)
    )

  // 页面结构变化或被拦截时解析不到数据，此时保留旧文件
  if (!result.length) {
    throw new Error('页面中没有解析到数据')
  }

  const keptResult = result.filter(
    item => !site.exclude?.some(rule => rule.test(item.nameDetail))
  )
  const uniqueResult = uniqBy(keptResult, 'nameDetail')
  const sortedResult = orderBy(uniqueResult, ['mark'], ['desc'])

  fs.writeFileSync(
    `${OUTPUT_PATH}/${site.fileName}.json`,
    JSON.stringify(sortedResult, null, 2)
  )
  return { count: sortedResult.length, excluded: result.length - keptResult.length }
}

const startTime = Date.now()
fs.mkdirSync(OUTPUT_PATH, { recursive: true })

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

async function update(browser, site) {
  const { count, excluded } = save(site, await fetchData(browser, site))
  const excludedText = excluded ? `，按名称规则排除 ${excluded} 条` : ''
  console.log(
    chalk.greenBright('成功:'),
    `${site.fileName}.json（${count} 条${excludedText}）`
  )
}

const failedSites = []
for (const site of sites) {
  await update(browser, site).catch(error => {
    failedSites.push(site)
    console.warn(
      chalk.yellow(`${site.fileName}.json 获取失败，稍后重试，${error.message}`)
    )
  })
}

// topcpu 在 GitHub Actions 上偶尔有请求一直等不到响应，失败的数据源最后再试一次
let hasError = false
for (const site of failedSites) {
  await update(browser, site).catch(error => {
    hasError = true
    console.error(
      chalk.red(
        `错误：${site.fileName}.json 未更新，${site.urls.join(' ')}，${error.message}`
      )
    )
  })
}

await browser.close()

const elapsedSeconds = (Date.now() - startTime) / 1000
console.log(chalk.bgGreen(`耗时: ${elapsedSeconds.toFixed(2)}秒数据拉取完毕`))

// 有数据源失败时以非零状态退出，让 GitHub Actions 把这次运行标记为失败
if (hasError) {
  process.exitCode = 1
}
