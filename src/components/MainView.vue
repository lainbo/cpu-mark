<template>
  <div
    ref="mainRef"
    class="contain pt-0 px-0 pb-16px lg:pt-16px lg:px-32px w-full h-[calc(100vh-40px)] flex flex-col items-center bg-[#f2f2f2] space-y-28px overflow-x-hidden overflow-y-auto transition-all dark:bg-dark-300"
  >
    <!-- 对比部分 -->
    <div class="card_wrapper !pb-0" v-if="selectArr.length">
      <div class="flex justify-between items-center">
        <h2 class="text_decorate">
          对比
        </h2>
        <a-button @click="resetCompare" status="danger">清空对比</a-button>
      </div>
      <div v-for="(item, index) in selectArr" :key="index">
        <div class="font-bold text-16px space-x-8px text-[#333]">
          <span> {{ item.nameDetail }}</span>
          <span>{{ `(排名：${item.key})` }}</span>
        </div>
        <div class="flex items-center space-x-6px">
          <a-progress
            :percent="item.percentage"
            :show-text="false"
            size="large"
            color="#165dff"
          />
          <span>{{ formatNum(item.mark) }}</span>
        </div>
        <a-divider style="border-bottom-style: dashed" />
      </div>
    </div>

    <!-- 表格部分 -->
    <div class="card_wrapper !pb-16px mt-8px">
      <div class="flex items-center justify-between">
        <div class="flex space-x-6px">
          <h2 class="text_decorate">
            {{ pageConfig.title }}
          </h2>
          <span class="inline-block" v-if="pageConfig.question">
            <a-popover position="bottom">
              <a-link>{{ pageConfig.question }}</a-link>
              <template #content>
                <p>{{ pageConfig.answer }}</p>
              </template>
            </a-popover>
          </span>
        </div>
        <div class="flex items-center space-x-4px">
          <span class="text-16px select-none">搜索：</span>
          <a-input
            v-model="searchText"
            :placeholder="pageConfig.placeholder"
            :style="{ width: '220px' }"
            allow-clear
          />
        </div>
      </div>

      <div class="table_main">
        <vxe-table
          stripe
          ref="tableRef"
          show-overflow
          :height="innerHeight - 100"
          :data="tableData"
          :row-config="{ isHover: true }"
          @checkbox-change="selectChangeEvent"
          :checkbox-config="{ checkStrictly: true }"
        >
          <vxe-column type="checkbox" title="比较" width="65" />
          <vxe-column field="key" title="排名" width="80" sortable />
          <vxe-column field="nameDetail" title="CPU型号" />
          <vxe-column field="mark" title="性能" width="250" sortable>
            <template #default="{ row }">
              <div class="space-x-6px">
                <a-progress
                  :percent="row.percentage"
                  :style="{ width: '70%' }"
                  :show-text="false"
                  color="#165dff"
                />
                <span>{{ formatNum(row.mark) }}</span>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/utils/setTheme.js'
import { formatNum } from '@/utils/formatNum.js'
import { cloneDeep, throttle } from 'lodash'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  pageConfig: {
    type: Object,
    default: () => {},
  },
})

const mainRef = ref() // 主体部分的 ref
const { height: innerHeight } = useElementSize(mainRef) // 响应式主体部分高度

const originalData = Object.freeze(cloneDeep(props.tableData)) // 原始数据
const MaxRank = Math.max(...originalData.map(i => i.mark)) // 数据中性能最大值

// 数据处理：给每一条数据添加一个百分比属性
originalData.forEach(i => {
  i.percentage = parseFloat((i.mark / MaxRank).toFixed(3))
})

const tableData = ref(originalData) // 表格数据
const selectArr = ref([]) // 选中的数据
const tableRef = ref() // 表格ref

// 表格checkbox选中事件
const selectChangeEvent = ({ row }) => {
  const arr = cloneDeep(selectArr.value)
  const index = arr.findIndex(i => i.key === row.key)
  index >= 0 ? arr.splice(index, 1) : arr.push(row)
  selectArr.value = arr.sort((a, b) => b.mark - a.mark)
}

// 清空比较
const resetCompare = () => {
  tableRef.value.clearCheckboxRow()
  selectArr.value = []
}

const searchText = ref('') // 搜索文本

// 文字转小写并去除所有空格
const handleText = (str = '') => {
  return str.toLowerCase().replaceAll(' ', '')
}
watch(
  searchText,
  throttle(() => {
    tableData.value = originalData.filter(item => {
      return handleText(item.nameDetail).includes(handleText(searchText.value))
    })
    // 设置表格选中
    tableRef.value.setCheckboxRow(cloneDeep(selectArr.value), true)
  }, 200)
)
</script>

<style lang="scss" scoped>
.card_wrapper {
  @apply pb-16px pt-16px px-16px rounded-b-8px shadow-xl w-full min-w-500px space-y-10px bg-white lg:rounded-8px dark:shadow-black dark:shadow-lg dark:bg-dark-300 dark:text-white;
}
.table_main {
  @media (prefers-color-scheme: dark) {
    filter: invert(1) hue-rotate(0.5turn) !important;
  }
}
.text_decorate {
  text-indent: 0.8em;
  @apply font-bold text-20px flex items-center leading-24px relative;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 80%;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #165dff;
    border-radius: 3px;
  }
}
</style>
