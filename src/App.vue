<template>
  <div class="main_app">
    <a-tabs v-model:active-key="activeName" lazy-load>
      <a-tab-pane :key="1" :title="pageConfig.gb6cpuM.title">
        <MainView :page-data="gb6MData" :page-config="pageConfig.gb6cpuM" />
      </a-tab-pane>
      <a-tab-pane :key="2" :title="pageConfig.gb6cpuS.title">
        <MainView :page-data="gb6SData" :page-config="pageConfig.gb6cpuS" />
      </a-tab-pane>
      <a-tab-pane :key="3" :title="pageConfig.r23cpuM.title">
        <MainView :page-data="r23MData" :page-config="pageConfig.r23cpuM" />
      </a-tab-pane>
      <a-tab-pane :key="4" :title="pageConfig.r23cpuS.title">
        <MainView :page-data="r23SData" :page-config="pageConfig.r23cpuS" />
      </a-tab-pane>
      <!-- <a-tab-pane :key="5" title="CPU综合对比">
        <MainView
          :all-data="[gb6MData, gb6SData]"
          :page-config="pageConfig.synthesis"
          :cpu-compared="true"
        />
      </a-tab-pane> -->
      <a-tab-pane :key="6" :title="pageConfig.soc.title">
        <MainView :page-data="socData" :page-config="pageConfig.soc" />
      </a-tab-pane>
      <a-tab-pane :key="7" :title="pageConfig.gpu.title">
        <MainView :page-data="gpuData" :page-config="pageConfig.gpu" />
      </a-tab-pane>

      <a-tab-pane :key="8" :title="pageConfig.drive.title">
        <MainView :page-data="hardDriveData" :page-config="pageConfig.drive" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import MainView from './components/MainView.vue'
import gb6MData from '@/assets/staticData/gb6MData.json'
import gb6SData from '@/assets/staticData/gb6SData.json'
import r23MData from '@/assets/staticData/r23MData.json'
import r23SData from '@/assets/staticData/r23SData.json'
import socData from '@/assets/staticData/socData.json'
import gpuData from '@/assets/staticData/gpuData.json'
import hardDriveData from '@/assets/staticData/hardDriveData.json'

const activeName = ref(1) // 默认选中的tab
onMounted(() => {
  if (window?.utools) {
    utoolsInit()
  }
})

const utoolsInit = () => {
  const payloadMap = {
    r23: 3,
    显卡: 7,
    gpu: 7,
    硬盘: 8,
    hdd: 8,
    ssd: 8,
    disk: 8,
    安兔兔: 6,
  }

  window.utools.onPluginEnter(({ payload }) => {
    activeName.value = payloadMap[payload] || 1
  })

  window.utools.subInputBlur()
}

const gb6Answer = `
<ul class="list-disc pl-16px">
  <li>这是一款多功能CPU性能测试工具，它模拟日常计算任务来测试性能。</li>
  <li>单核性能测试中，它测量CPU处理单个任务时的效率，这反映了处理器在执行单线程任务时的能力，对于大多数日常应用、游戏来说，单核性能更为关键。</li>
  <li>多核性能测试评估了CPU在同时处理多个任务时的效率，这对于需要大量并行处理的应用，如视频编辑、3D渲染和复杂的科学计算，更为重要。</li>
</ul>
`
const r23Answer = `
<ul class="list-disc pl-16px">
  <li>这是一款专注于评估CPU图形渲染能力的性能测试软件，广泛用于测试和比较不同CPU在3D图形和高强度视觉效果处理方面的性能。</li>
  <li>单核测试反映了CPU在处理需要连续计算的单线程任务时的性能，适用于评估处理器在不依赖多核优势的场景中的表现。</li>
  <li>多核测试则测量CPU在执行多线程、高强度的渲染任务时的能力，对于专业的视频编辑、3D建模和渲染等高负载工作场景尤为重要。</li>
  <li>它的测试结果是衡量CPU在专业级图形处理任务中性能的重要指标。</li>
</ul>
`
const pageConfig = {
  gb6cpuM: {
    title: 'Geekbench 6多核',
    question: 'Geekbench6能体现什么?',
    answer: gb6Answer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'gb6cpu',
  },
  gb6cpuS: {
    title: 'Geekbench 6单核',
    question: 'Geekbench6能体现什么?',
    answer: gb6Answer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'gb6cpuS',
  },
  r23cpuM: {
    title: 'Cinebench R23多核',
    question: 'Cinebench R23能体现什么?',
    answer: r23Answer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'r23cpuM',
  },
  r23cpuS: {
    title: 'Cinebench R23单核',
    question: 'Cinebench R23能体现什么?',
    answer: r23Answer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'r23cpuS',
  },
  soc: {
    title: '安兔兔',
    question: '这里是移动端处理器',
    answer:
      '安兔兔跑分并不能完全代表实际使用体验，还要结合功耗和优化来看，仅供参考，不构成购买建议',
    placeholder: '请输入CPU型号，如A16',
    flag: 'soc',
  },
  gpu: {
    title: '显卡天梯',
    question: '显卡得分解释',
    answer:
      '得分为G3D Mark得分，也就是3D Graphics Mark。该得分包含了多个测试环节，如DirectX 9到DirectX 12的性能测试、复杂的游戏引擎渲染测试、GPU计算能力测试等。每个环节都会得到一个分数，这些分数会被总结为一个总的G3D Mark分数，这个分数反映了显卡的整体3D渲染性能。G3D Mark的分数只是一个参考，它不完全决定一款显卡在所有应用和游戏中的性能。如显存容量、显存带宽、驱动程序的优化等，也会影响显卡的实际性能',
    placeholder: '请输入显卡型号，如4080',
    flag: 'gpu',
  },
  drive: {
    title: '硬盘天梯',
    question: '如何知道硬盘具体型号？',
    answer:
      '硬盘的性能和容量也是相关的，固态硬盘中，一般1T、2T的性能大于500G，大于250G，所以需要知道具体容量对应的型号才能得到准确的信息。机械硬盘容量与性能关系更加明显，某些情况下可能是完全两个不同硬盘的感觉，如：查询“希捷酷鱼 1TB”的性能数据，建议到京东的对应商品的页面，商品图文详情的上方，“规格与包装”里面会有这款硬盘的具体型号，得到具体型号“ST1000DM010”，同型号的2TB版本“ST2000DM005”，是一个“叠瓦式”硬盘，两者性能差距较大',
    placeholder: '请输入硬盘型号，如980Pro',
    flag: 'disk',
  },
  synthesis: {
    title: 'CPU综合对比',
    question: '如何知道一款CPU是否适合我？',
    answer:
      'CPU排名只是一个参考点，不能全面代表实际体验。性能分数虽有指导作用，但不代表游戏中的实际表现。由于不同游戏可能针对特定品牌CPU有特别优化，同一CPU在不同游戏中的表现可能会有差异，还有5600X3D、5800X3D这种单核性能低但游戏性能极高的CPU。因此，在选购CPU前，建议综合网上多方信息，全面了解后再做决定。',
    placeholder: '请输入CPU型号，如12700K',
  },
}
</script>

<style lang="scss" scoped>
.main_app {
  background-color: var(--color-bg-1);
  ::v-deep(.arco-tabs-content) {
    padding-top: 0;
  }
}
</style>
