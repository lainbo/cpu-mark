import fs from 'fs'
import { parse } from 'node-html-parser'
import { uniqBy, orderBy } from 'lodash-es'
import chalk from 'chalk'

const OUTPUT_PATH = './src/assets/staticData'
const TIMEOUT = 30000

// topcpu 的各个排行页结构相同：每行一个 CPU 链接，同一行里的加粗 span 是分数
function parseTopCpu(root) {
  return root.querySelectorAll('a.hover\\:no-underline[href^="/cpu/"]').map(a => ({
    name: a.text,
    mark: a.parentNode.querySelector('span.mx-2.text-slate-900.text-sm.font-bold')?.text,
  }))
}

const sites = [
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-multi-core',
    parse: parseTopCpu,
    fileName: 'gb6MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/geekbench-6-single-core',
    parse: parseTopCpu,
    fileName: 'gb6SData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-multi-core',
    parse: parseTopCpu,
    fileName: 'r23MData',
  },
  {
    url: 'https://www.topcpu.net/cpu-r/cinebench-r23-single-core',
    parse: parseTopCpu,
    fileName: 'r23SData',
  },
  {
    url: 'https://www.topcpu.net/soc-r',
    parse: parseTopCpu,
    fileName: 'socData',
  },
  {
    url: 'https://browser.geekbench.com/opencl-benchmarks',
    // 名称单元格里还有一个 description 子元素，只取它前面的文本
    parse: root =>
      root.querySelectorAll('#opencl tbody tr').map(tr => ({
        name: tr.querySelector('td.name')?.firstChild?.text,
        mark: tr.querySelector('td.score')?.text,
      })),
    fileName: 'gpuData',
  },
  {
    url: 'https://www.harddrivebenchmark.net/hdd_list.php',
    parse: root =>
      root.querySelectorAll('#cputable tbody tr').map(tr => ({
        name: tr.children[0]?.text,
        mark: tr.children[2]?.text,
      })),
    fileName: 'hardDriveData',
  },
]

async function fetchHtml(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  if (res.headers.get('cf-mitigated') === 'challenge') {
    throw new Error('请求被 Cloudflare 人机验证拦截')
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.text()
}

async function crawl(site) {
  const root = parse(await fetchHtml(site.url))
  const result = site
    .parse(root)
    .map(({ name = '', mark = '' }) => ({
      nameDetail: name.replace(/\s+/g, ' ').trim(),
      mark: Number(mark.replace(/,/g, '').trim()),
    }))
    .filter(item => item.nameDetail && Number.isFinite(item.mark))

  // 页面结构变化或被拦截时解析不到数据，此时保留旧文件
  if (!result.length) {
    throw new Error('页面中没有解析到数据')
  }

  const uniqueResult = uniqBy(result, 'nameDetail')
  const sortedResult = orderBy(uniqueResult, ['mark'], ['desc'])

  fs.writeFileSync(
    `${OUTPUT_PATH}/${site.fileName}.json`,
    JSON.stringify(sortedResult, null, 2)
  )
  return sortedResult.length
}

const startTime = Date.now()
fs.mkdirSync(OUTPUT_PATH, { recursive: true })

const results = await Promise.allSettled(sites.map(crawl))

results.forEach(({ status, value, reason }, i) => {
  const { fileName, url } = sites[i]
  if (status === 'fulfilled') {
    console.log(chalk.greenBright('成功:'), `${fileName}.json（${value} 条）`)
  } else {
    console.error(chalk.red(`错误：${fileName}.json 未更新，${url}，${reason.message}`))
  }
})

const elapsedSeconds = (Date.now() - startTime) / 1000
console.log(chalk.bgGreen(`耗时: ${elapsedSeconds.toFixed(2)}秒数据拉取完毕`))

// 有数据源失败时以非零状态退出，让 GitHub Actions 把这次运行标记为失败
if (results.some(({ status }) => status === 'rejected')) {
  process.exitCode = 1
}
