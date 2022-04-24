<template>
  <div class="main_app">
    <a-tabs default-active-key="1" lazy-load>
      <template #extra>
        <a-popover title="数据更新时间：2022年4月24日">
          <div class="pr-16px flex items-center cursor-pointer">
            <icon-clock-circle :size="18" />
          </div>
          <template #content>
            <h2 class="text-blue-700">CPU多核新增：</h2>
            <p>Intel Core i9-12900KS</p>
            <p>Intel Core i5-12500T</p>
            <p>Intel Core i3-12100T</p>
            <p>AMD Ryzen 7 5800X3D</p>
            <p>AMD Ryzen 7 5700X</p>
            <p>等20余个型号</p>
            <br />
            <h2 class="text-blue-700">CPU单核新增：</h2>
            <h2>575条数据</h2>
            <br />
            <p class="text-blue-700">显卡新增：</p>
            <p>837条数据</p>
          </template>
        </a-popover>
      </template>
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
import { IconClockCircle } from '@arco-design/web-vue/es/icon'
import { cpuData } from '@/assets/staticData/cpuData.js'
import { cpuSingleCoreData } from '@/assets/staticData/cpuSingleCoreData.js'
import { gpuData } from '@/assets/staticData/gpuData.js'

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
    question: '',
    answer: '',
    placeholder: '请输入显卡型号，如1050'
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
