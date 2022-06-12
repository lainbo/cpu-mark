<template>
  <div class="main_app">
    <a-tabs v-model:active-key="activeName" lazy-load>
      <template #extra>
        <a-popover :title="`数据更新时间：${updateObj.date}`" position="br">
          <div class="pr-16px flex items-center cursor-pointer">
            <icon-clock-circle :size="18" />
          </div>
          <template #content>
            <a-divider orientation="center">较上次新增数据</a-divider>
            <section class="space-y-10px">
              <div v-for="(item, index) in updateObj.updateArr" :key="index">
                <h2 class="text-blue-700">{{ item.label }}:</h2>
                <h2>
                  新增{{ item.addNum }}个型号 (共计:{{ item.totalNum }}个)
                </h2>
              </div>
            </section>
          </template>
        </a-popover>
      </template>
      <a-tab-pane :key="1" :title="pageConfig.cpuM.title">
        <MainView :table-data="cpuMData" :page-config="pageConfig.cpuM" />
      </a-tab-pane>
      <a-tab-pane :key="2" :title="pageConfig.cpuS.title">
        <MainView :table-data="cpuSData" :page-config="pageConfig.cpuS" />
      </a-tab-pane>
      <a-tab-pane :key="3" title="CPU综合对比">
        <MainView
          :all-data="[cpuMData, cpuSData]"
          :page-config="pageConfig.synthesis"
          :cpu-compared="true"
        />
      </a-tab-pane>
      <a-tab-pane :key="4" :title="pageConfig.gpu.title">
        <MainView :table-data="gpuData" :page-config="pageConfig.gpu" />
      </a-tab-pane>
      <a-tab-pane :key="5" :title="pageConfig.drive.title">
        <MainView :table-data="hardDriveData" :page-config="pageConfig.drive" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import { IconClockCircle } from '@arco-design/web-vue/es/icon'
import { uniqBy } from 'lodash-es'
import MainView from './components/MainView.vue'
import { cpuData } from '@/assets/staticData/cpuData.js'
import { cpuSingleCoreData } from '@/assets/staticData/cpuSingleCoreData.js'
import { gpuOriginData } from '@/assets/staticData/gpuData.js'
import { hardDriveOriginData } from '@/assets/staticData/hardDriveData.js'
import { reactive } from 'vue'

// 原数据有重复的，这里进行去重
const cpuMData = uniqArr(cpuData)
const cpuSData = uniqArr(cpuSingleCoreData)
const gpuData = uniqArr(gpuOriginData)
const hardDriveData = uniqArr(hardDriveOriginData)

const activeName = ref(1) // 默认选中的tab
const updateObj = reactive({
  date: '2022年6月12日',
  updateArr: [
    {
      label: 'CPU多核',
      addNum: 0,
      totalNum: cpuMData.length
    },
    {
      label: 'CPU单核',
      addNum: 5,
      totalNum: cpuSData.length
    },
    {
      label: '显卡',
      addNum: 0,
      totalNum: gpuData.length
    },
    {
      label: '硬盘',
      addNum: 14,
      totalNum: hardDriveData.length
    }
  ]
})
onMounted(() => {
  if (!window?.utools) return
  utoolsInit()
})

const utoolsInit = () => {
  window.utools.onPluginEnter(({ payload }) => {
    if (['显卡', 'gpu', 'GPU'].includes(payload)) {
      activeName.value = 4
    } else if (['硬盘', 'hdd', 'HDD', 'ssd', 'SSD'].includes(payload)) {
      activeName.value = 5
    } else {
      activeName.value = 1
    }
  })
  window.utools.subInputBlur()
}

// 去重函数
function uniqArr(arr) {
  return uniqBy(arr, 'nameDetail')
}
const cpuAnswer =
  '就像搬砖一样，一个核心就是一个人，核心强弱就像这个人力气大小。A这边有1个人，但是力气很大，一次搬10块砖。B这边有4个人，但是这4个人力气都小，一个人一次搬3块砖。四个人一次一共搬12块，看起来B这边更强，但是，人越多配合的难度越高，可能有人在工作，有人在偷懒，这时要考验监工的能力（也就是软件对多核心的优化程度）。在实际当中，大部分办公软件、网游、小型软件都更看重单核性能，例如腾讯的绝大部分网游，或轻负载低上限的软件；而专业软件（如：代码编辑器、视频渲染剪辑、直播、图片处理软件）和一些3A大作会对多核心进行优化'
const pageConfig = {
  cpuM: {
    title: 'CPU多核天梯',
    question: '单核、多核性能的区别？',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如5800X'
  },
  cpuS: {
    title: 'CPU单核天梯',
    question: '单核、多核性能的区别？',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如5800X'
  },
  gpu: {
    title: '显卡天梯',
    question: '显卡得分解释',
    answer:
      '得分融合了PerformanceTest，微软DirectX API中的DirectCompute，Khronos的OpenCL中的各项数据，各项数据的权重也各不相同，最终得分是由成千上万的同型号显卡平均得出，不完全反映其游戏性能，数据仅供参考。',
    placeholder: '请输入显卡型号，如1050'
  },
  drive: {
    title: '硬盘天梯',
    question: '如何知道硬盘具体型号？',
    answer:
      '硬盘的性能和容量也是相关的，固态硬盘中，一般1T、2T的性能大于500G，大于250G，所以需要知道具体容量对应的型号才能得到准确的信息。机械硬盘容量与性能关系更加明显，某些情况下可能是完全两个不同硬盘的感觉，如：查询“希捷酷鱼 1TB”的性能数据，建议到京东的对应商品的页面，商品图文详情的上方，“规格与包装”里面会有这款硬盘的具体型号，得到具体型号“ST1000DM010”，同型号的2TB版本“ST2000DM005”，是一个“叠瓦式”硬盘，两者性能差距较大',
    placeholder: '请输入硬盘型号，如980Pro'
  },
  synthesis: {
    title: 'CPU综合对比',
    question: '如何知道一款CPU是否适合我？',
    answer:
      '数据的排名靠前，并不代表这个CPU真的适合你，比如你需要一个打游戏的电脑，不知道如何CPU超频，还希望有着优秀的性价比，那么5800X 3D可能是你最好的选择，因为它有更大的CPU三级缓存，这让它在大部分游戏下的表现，和比他贵了2000多元的12900KS相当，但是仅从表格中可以得到的数据来看，他的单核、多核都不是特别的出彩，但是如果你会超频，你肯定知道去买一个散片12900KF超频可以爆杀5800X 3D。另一方面，除非你知道自己在做什么，否则不要去只依靠表格排名，去做你的购买参考，排名不能代表实际体验，数据仅供参考，所以如果对CPU只有一知半解，建议去网上多方综合了解后再购买',
    placeholder: '请输入CPU型号，如5800X'
  }
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
