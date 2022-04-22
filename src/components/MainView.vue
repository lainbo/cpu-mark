<template>
  <div ref="mainRef" class="content_wrapper">
    <!-- 对比部分 -->
    <div
      v-if="selectArr.length"
      class="card_wrapper lg:(flex flex-col pb-16px)"
    >
      <div class="flex justify-between items-center">
        <h2 class="text_decorate">对比</h2>
        <a-button status="danger" @click="resetCompare">清空对比</a-button>
      </div>
      <div class="lg:(overflow-y-auto flex-1)">
        <div v-for="item in selectArr" :key="item.key">
          <div
            class="font-bold text-16px space-x-8px text-[#333] dark:text-light-900"
          >
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
    </div>

    <!-- 表格部分 -->
    <div class="card_wrapper !pb-16px">
      <div class="flex items-center justify-between">
        <div class="flex space-x-6px">
          <h2 class="text_decorate">
            {{ pageConfig.title }}
          </h2>
          <span v-if="pageConfig.question" class="inline-block">
            <a-popover position="bottom">
              <a-link>{{ pageConfig.question }}</a-link>
              <template #content>
                <p>{{ pageConfig.answer }}</p>
              </template>
            </a-popover>
          </span>
        </div>
        <div class="flex items-center space-x-4px">
          <span class="text-16px select-none lg:hidden">搜索：</span>
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
          ref="tableRef"
          stripe
          show-overflow
          :height="innerHeight - 100"
          :data="tableData"
          :row-config="{ isHover: true }"
          :checkbox-config="{ showHeader: false }"
          :tooltip-config="{
            theme: isDark ? 'light' : 'dark',
            enterDelay: 0,
            enterable: true
          }"
          @checkbox-change="selectChangeEvent"
        >
          <vxe-column type="checkbox" title="比较" width="65" />
          <vxe-column field="key" title="排名" width="80" sortable />
          <vxe-column field="nameDetail" title="型号" />
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
import { sort } from '@/utils/timSort.js'
import { cloneDeep, throttle } from 'lodash-es'

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  pageConfig: {
    type: Object,
    default: () => {}
  }
})
const isDark = useDark() // 响应式：是否为暗色
const mainRef = ref() // 主体部分的 ref
const { height: innerHeight } = useElementSize(mainRef) // 响应式主体部分高度

// 数据处理
const tempArr = cloneDeep(props.tableData)
const MaxRank = Math.max(...tempArr.map(i => i.mark)) // 数据中性能最大值
sort(tempArr, (a, b) => b.mark - a.mark) // 根据性能降序排序
// 添加排名、百分比字段
tempArr.forEach((i, idx) => {
  i.key = idx + 1
  i.percentage = parseFloat((i.mark / MaxRank).toFixed(3))
})

const originalData = Object.freeze(cloneDeep(tempArr)) // 原始数据

// 数据处理：给每一条数据添加一个百分比属性

const tableData = ref(originalData) // 表格数据
const selectArr = ref([]) // 选中的数据
const tableRef = ref() // 表格ref

// 表格checkbox选中事件
const selectChangeEvent = ({ row }) => {
  const arr = cloneDeep(selectArr.value)
  const index = arr.findIndex(i => i.key === row.key)
  index >= 0 ? arr.splice(index, 1) : arr.push(row)
  sort(arr, (a, b) => b.mark - a.mark)
  selectArr.value = arr
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
.content_wrapper {
  @apply pt-0 px-0 pb-16px  w-full h-[calc(100vh-40px)] flex flex-col items-center bg-[#f2f2f2] space-y-28px overflow-x-hidden overflow-y-auto transition-all lg:(pt-16px px-32px flex-row items-stretch space-y-0 gap-16px flex-row-reverse) dark:bg-dark-300;
}
.card_wrapper {
  @apply pb-16px pt-16px px-16px rounded-b-8px shadow-xl w-full min-w-500px space-y-10px bg-white  dark:(shadow-black shadow-lg bg-dark-300 text-white) lg: (rounded-8px);
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .table_main {
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
