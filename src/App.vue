<template>
  <div class="main_app">
    <a-tabs default-active-key="1" lazy-load>
      <a-tab-pane key="1" :title="pageConfig.cpuM.title">
        <MainView :table-data="cpuData" :page-config="pageConfig.cpuM" />
      </a-tab-pane>
      <a-tab-pane key="2" :title="pageConfig.cpuS.title">
        <MainView
          :table-data="cpuSingleCoreData"
          :page-config="pageConfig.cpuS"
        />
      </a-tab-pane>
      <a-tab-pane key="3" :title="pageConfig.gpu.title">
        <MainView :table-data="gpuData" :page-config="pageConfig.gpu" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script setup>
import MainView from './components/MainView.vue'
import { cpuData } from '@/assets/staticData/cpuData.js'
// import { cpuData2 } from '@/assets/staticData/cpuData.js'
import { cpuSingleCoreData } from '@/assets/staticData/cpuSingleCoreData.js'
import { gpuData } from '@/assets/staticData/gpuData.js'

const cpuAnswer =
  '就像搬砖一样，一个核心就是一个人，核心强弱就像这个人力气大小。A这边有1个人，但是力气很大，一次搬10块砖。B这边有4个人，但是这4个人力气都小，一个人一次搬3块砖。四个人一次一共搬12块，看起来B这边更强，但是，人越多配合的难度越高，可能有人在工作，有人在偷懒，这时要考验监工的能力（也就是软件对多核心的优化程度）。在实际当中，大部分办公软件、网游、小型软件都更看重单核性能，例如腾讯的绝大部分网游，或轻负载低上限的软件；而专业软件（如：代码编辑器、视频渲染剪辑、直播、图片处理软件）和一些3A大作会对多核心进行优化'
const pageConfig = {
  cpuM: {
    title: 'CPU多核天梯',
    question: '单核性能和多核性能的区别？',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如5800X',
  },
  cpuS: {
    title: 'CPU单核天梯',
    question: '单核性能和多核性能的区别？',
    answer: cpuAnswer,
    placeholder: '请输入CPU型号，如5800X',
  },
  gpu: {
    title: '显卡天梯',
    question: '',
    answer: '',
    placeholder: '请输入显卡型号，如1050',
  },
}
</script>

<style lang="scss" scoped>
.main_app {
  ::v-deep(.arco-tabs-content) {
    padding-top: 0;
  }
}
</style>
