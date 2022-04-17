<template>
  <div
    class="contain w-screen h-screen flex flex-col items-center pt-32px bg-[#f2f2f2] space-y-32px overflow-x-hidden dark:bg-dark-300"
  >
    <div class="card_wrapper" v-if="resultArr.length">
      <a-button @click="resetCompare">清空比较</a-button>
      <div v-for="(item, index) in resultArr" :key="index">
        <div class="">
          <div class="font-bold text-16px">{{ item.cpuName }}</div>
          <div class="flex items-center space-x-8px">
            <a-progress
              :percent="item.percentage"
              :show-text="false"
              size="large"
              color="#165dff"
            />
            <span>{{ item.cpuMark }}</span>
          </div>
          <a-divider style="border-bottom-style: dashed" />
        </div>
      </div>
    </div>

    <div class="card_wrapper !pb-32px">
      <a-input
        v-model.trim="searchText"
        placeholder="请输入CPU型号，如9700K"
        allow-clear
        size="large"
      ></a-input>
      <a-table
        stripe
        :filter-icon-align-left="true"
        :data="tableData"
        :row-selection="rowSelection"
        :virtual-list-props="{ height: windowHeight - 300 }"
        :pagination="false"
        @selection-change="onSelectionChange"
      >
        <template #columns>
          <a-table-column title="排名" data-index="key" :width="70" />
          <a-table-column title="CPU型号" data-index="cpuName" />
          <a-table-column title="性能" data-index="cpuMark" :width="250">
            <template #cell="{ record }">
              <div class="space-x-8px">
                <a-progress
                  :percent="record.percentage"
                  :style="{ width: '70%' }"
                  :show-text="false"
                  color="#165dff"
                />
                <span>{{ record.cpuMark }}</span>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import '@/utils/setTheme.js'
import { cpuData } from '@/assets/staticData/cpuData.js'
import { cloneDeep, throttle } from 'lodash'
const windowHeight = window.innerHeight
const originalData = Object.freeze(cloneDeep(cpuData))
const MaxRank = Math.max(...originalData.map(item => item.cpuMark))
originalData.forEach(item => {
  item.percentage = parseFloat((item.cpuMark / MaxRank).toFixed(3))
})

const tableData = ref(originalData)
const resetCompare = () => {
  rowSelection.selectedRowKeys = []
}
const onSelectionChange = selectArr => {
  rowSelection.selectedRowKeys = selectArr
}
const resultArr = computed(() => {
  const result = []
  rowSelection.selectedRowKeys.forEach(i => {
    const resultItem = originalData.find(item => item.key === i)
    result.push(resultItem)
  })
  return result.sort((a, b) => b.cpuMark - a.cpuMark)
})
const searchText = ref('')

watch(
  searchText,
  throttle(() => {
    tableData.value = originalData.filter(item => {
      return item.cpuName.toLowerCase().includes(searchText.value.toLowerCase())
    })
  }, 200)
)
const rowSelection = reactive({
  type: 'checkbox',
  title: '选择',
  selectedRowKeys: [],
})
</script>

<style lang="scss" scoped>
.card_wrapper {
  @apply pb-16px pt-32px px-32px rounded-8px shadow-xl w-11/12 min-w-500px space-y-16px bg-white dark:shadow-black dark:shadow-lg;
}
</style>
