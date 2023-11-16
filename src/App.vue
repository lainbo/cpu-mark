<template>
  <div class="main_app">
    <a-tabs v-model:active-key="activeName" lazy-load>
      <a-tab-pane :key="2" :title="pageConfig.cpuS.title">
        <MainView :page-data="cpuSData" :page-config="pageConfig.cpuS" />
      </a-tab-pane>
      <a-tab-pane :key="1" :title="pageConfig.cpuM.title">
        <MainView :page-data="cpuMData" :page-config="pageConfig.cpuM" />
      </a-tab-pane>
      <a-tab-pane :key="3" title="CPU综合对比">
        <MainView
          :all-data="[cpuMData, cpuSData]"
          :page-config="pageConfig.synthesis"
          :cpu-compared="true"
        />
      </a-tab-pane>
      <a-tab-pane :key="4" :title="pageConfig.gpu.title">
        <MainView :page-data="gpuData" :page-config="pageConfig.gpu" />
      </a-tab-pane>
      <a-tab-pane :key="5" :title="pageConfig.drive.title">
        <MainView :page-data="hardDriveData" :page-config="pageConfig.drive" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import { uniqBy } from 'lodash-es'
import MainView from './components/MainView.vue'
import cpuData from '@/assets/staticData/cpuMData.json'
import cpuSingleCoreData from '@/assets/staticData/cpuSData.json'
import gpuOriginData from '@/assets/staticData/gpuData.json'
import hardDriveOriginData from '@/assets/staticData/hardDriveData.json'

// 原数据有重复的，这里进行去重
const cpuMData = uniqArr(cpuData)
const cpuSData = uniqArr(cpuSingleCoreData)
const gpuData = uniqArr(gpuOriginData)
const hardDriveData = uniqArr(hardDriveOriginData)

const activeName = ref(2) // 默认选中的tab
const updateObj = reactive({
  date: '2023年10月29日',
})
onMounted(() => {
  if (window?.utools) {
    utoolsInit()
  }
})

const utoolsInit = () => {
  window.utools.onPluginEnter(({ payload }) => {
    if (['显卡', 'gpu'].includes(payload)) {
      activeName.value = 4
    } else if (['硬盘', 'hdd', 'ssd', 'disk'].includes(payload)) {
      activeName.value = 5
    } else {
      activeName.value = 2
    }
  })
  window.utools.subInputBlur()
}

// 去重函数
function uniqArr(arr) {
  return uniqBy(arr, 'nameDetail')
}
const cpuAnswer = `
<ul class="list-disc pl-16px">
  <li>这是一款多功能CPU性能测试工具，它模拟日常计算任务来测试性能。</li>
  <li>在“单核”性能测试中，它测量CPU处理单个任务时的效率，这反映了处理器在执行单线程任务时的能力，对于大多数日常应用、游戏来说，单核性能更为关键。</li>
  <li>而“多核”性能测试评估了CPU在同时处理多个任务时的效率，这对于需要大量并行处理的应用，如视频编辑、3D渲染和复杂的科学计算，更为重要。</li>
</ul>

`
const pageConfig = {
  cpuM: {
    title: 'Geekbench6 多核',
    question: 'Geekbench6能体现什么?',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'cpuM',
  },
  cpuS: {
    title: 'Geekbench6 单核',
    question: 'Geekbench6能体现什么?',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如12700K',
    flag: 'cpuS',
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
