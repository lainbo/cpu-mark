<template>
  <div class="main_app">
    <a-tabs default-active-key="1" lazy-load>
      <template #extra>
        <a-popover :title="`数据更新时间：2022年5月6日`" position="br">
          <div class="pr-16px flex items-center cursor-pointer">
            <icon-clock-circle :size="18" />
          </div>
          <template #content>
            <a-divider orientation="center">较上次新增数据</a-divider>
            <section class="space-y-10px">
              <div>
                <h2 class="text-blue-700">CPU多核:</h2>
                <h2>新增5个型号 (共计:{{ cpuData.length }})</h2>
              </div>
              <div>
                <h2 class="text-blue-700">CPU单核:</h2>
                <h2>新增7个型号 (共计:{{ cpuSingleCoreData.length }})</h2>
              </div>
              <div>
                <p class="text-blue-700">显卡:</p>
                <p>新增2个型号 (共计:{{ cpuSingleCoreData.length }})</p>
              </div>
              <div>
                <p class="text-blue-700">硬盘:</p>
                <p>新增6个型号 (共计:{{ hardDriveData.length }})</p>
              </div>
              <div class="text-12px text-gray-400">
                如果型号有缺失，请通过评论及时反馈哦~
              </div>
            </section>
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
      <a-tab-pane key="4" :title="pageConfig.drive.title">
        <MainView :table-data="hardDriveData" :page-config="pageConfig.drive" />
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
import { hardDriveData } from '@/assets/staticData/hardDriveData.js'
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
  },
  drive: {
    title: '硬盘天梯',
    question: '如何知道硬盘具体型号？',
    answer:
      '硬盘的性能和容量也是相关的，固态硬盘中，一般1T、2T的性能大于500G，大于250G，所以需要知道具体容量对应的型号才能得到准确的信息。机械硬盘容量与性能关系更加明显，某些情况下可能是完全两个不同硬盘的感觉，如：查询“希捷酷鱼 1TB”的性能数据，建议到京东的对应商品的页面，商品图文详情的上方，“规格与包装”里面会有这款硬盘的具体型号，得到具体型号“ST1000DM010”，同型号的2TB版本“ST2000DM005”，是一个“叠瓦式”硬盘，两者性能差距较大',
    placeholder: '请输入硬盘型号，如980Pro'
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
