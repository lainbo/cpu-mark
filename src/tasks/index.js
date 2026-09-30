import puppeteer from 'puppeteer'
import fs from 'fs'
import { uniqBy, orderBy } from 'lodash-es'
import chalk from 'chalk'

const OUTPUT_PATH = './src/assets/staticData'
// topcpu 在 GitHub Actions 上偶尔要 30 秒以上才响应
const TIMEOUT = 60000

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

const sites = [
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-multi-core',
    ...topCpu,
    fileName: 'gb6MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-single-core',
    ...topCpu,
    fileName: 'gb6SData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-multi-core',
    ...topCpu,
    fileName: 'r23MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-single-core',
    ...topCpu,
    fileName: 'r23SData',
  },
  {
    url: 'https://www.topcpu.net/soc-r',
    ...topCpu,
    fileName: 'socData',
  },
  {
    url: 'https://browser.geekbench.com/opencl-benchmarks',
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
    url: 'https://www.harddrivebenchmark.net/hdd_list.php',
    waitFor: '#cputable tbody tr',
    code: () =>
      Array.from(document.querySelectorAll('#cputable tbody tr'), tr => ({
        name: tr.children[0]?.textContent,
        mark: tr.children[2]?.textContent,
      })),
    fileName: 'hardDriveData',
  },
]

async function firecrawl(url) {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({ url, formats: ['rawHtml'] }),
    signal: AbortSignal.timeout(TIMEOUT),
  })
  const { success, error, data } = await res.json()
  if (!success) {
    throw new Error(`Firecrawl 抓取失败，${error}`)
  }
  return data.rawHtml
}

async function fetchData(browser, site) {
  const page = await browser.newPage()
  try {
    if (site.viaFirecrawl) {
      // 只需要解析 HTML，不执行页面里的广告和统计脚本
      await page.setJavaScriptEnabled(false)
      await page.setContent(await firecrawl(site.url), { waitUntil: 'domcontentloaded' })
    } else {
      // 数据都在 HTML 里，DOM 解析完即可读取，不等广告和统计脚本加载
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })
      await page.waitForSelector(site.waitFor, { timeout: TIMEOUT })
    }
    return await page.evaluate(site.code)
  } finally {
    await page.close()
  }
}

function save(site, data) {
  const result = data
    .map(({ name = '', mark = '' }) => ({
      nameDetail: name.replace(/\s+/g, ' ').trim(),
      mark: Number(mark.replace(/,/g, '').trim()),
    }))
    .filter(item => item.nameDetail && Number.isFinite(item.mark))

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

let hasError = false
for (const site of sites) {
  try {
    const { count, excluded } = save(site, await fetchData(browser, site))
    const excludedText = excluded ? `，按名称规则排除 ${excluded} 条` : ''
    console.log(
      chalk.greenBright('成功:'),
      `${site.fileName}.json（${count} 条${excludedText}）`
    )
  } catch (error) {
    hasError = true
    console.error(
      chalk.red(`错误：${site.fileName}.json 未更新，${site.url}，${error.message}`)
    )
  }
}

await browser.close()

const elapsedSeconds = (Date.now() - startTime) / 1000
console.log(chalk.bgGreen(`耗时: ${elapsedSeconds.toFixed(2)}秒数据拉取完毕`))

// 有数据源失败时以非零状态退出，让 GitHub Actions 把这次运行标记为失败
if (hasError) {
  process.exitCode = 1
}
