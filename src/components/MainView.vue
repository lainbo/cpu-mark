<template>
  <div ref="mainRef" class="content_wrapper">
    <!-- 对比部分 -->
    <div v-if="calcComparedArr.length" class="card_wrapper lg:(flex flex-col pb-16px)">
      <div class="flex justify-between items-center">
        <h2 class="text_decorate">对比</h2>
        <a-button status="danger" @click="resetCompare">清空对比</a-button>
      </div>
      <div class="lg:(overflow-y-auto flex-1)">
        <div v-for="item in calcComparedArr" :key="item.key">
          <div
            class="font-bold flex justify-between text-16px space-x-12px text-[#333] dark:text-light-900"
          >
            <div class="truncate flex-1">
              {{ item.nameDetail }}
              <!-- 不是cpu对比的才有排名显示 -->
              <template v-if="!isCpuCompared">
                {{ `(排名：${item.key})` }}
              </template>
            </div>
            <div
              class="cursor-pointer w-16px h-16px flex items-center justify-center rounded-full transition-all hover:(text-[#f00] bg-red-100)"
              @click="removeCompareItem(item.key)"
            >
              <i class="i-material-symbols-close"></i>
            </div>
          </div>
          <div class="flex items-center space-x-6px">
            <template v-if="!isCpuCompared">
              <a-progress
                :percent="item.percentage"
                :show-text="false"
                size="large"
                color="#165dff"
              />
              <span>{{ formatNum(item.mark) }}</span>
            </template>

            <template v-else>
              <div class="flex w-full space-x-20px mt-8px">
                <section class="w-1/2">
                  <span>多核：{{ formatNum(item.mCoreMark) }}</span>
                  <span>（排名：第{{ item.mRank }}）</span>
                  <a-progress
                    :percent="item.mPercentage || 0"
                    :show-text="false"
                    size="large"
                    color="#165dff"
                  />
                </section>
                <section class="w-1/2">
                  <span>游戏：{{ formatNum(item.sCoreMark) }}</span>
                  <span>（排名：第{{ item.sRank }}）</span>
                  <a-progress
                    :percent="item.sPercentage || 0"
                    :show-text="false"
                    size="large"
                    color="#165dff"
                  />
                </section>
              </div>
            </template>
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
          <div v-if="pageConfig.question" class="truncate flex items-center">
            <a-popover position="bottom" :title="pageConfig.question">
              <a-link class="truncate">{{ pageConfig.question }}</a-link>
              <template #content>
                <div v-html="pageConfig.answer"></div>
              </template>
            </a-popover>
          </div>
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
          round
          stripe
          show-overflow
          :height="innerHeight - 80"
          :data="tableData"
          :row-config="{ isHover: true }"
          :checkbox-config="{ showHeader: false, trigger: 'row' }"
          :tooltip-config="{
            theme: isDark ? 'light' : 'dark',
            enterDelay: 0,
            enterable: true,
          }"
          @checkbox-change="selectChangeEvent"
        >
          <vxe-column type="checkbox" title="比较" width="65" />
          <vxe-column
            v-if="!isCpuCompared"
            field="key"
            title="排名"
            width="80"
            sortable
          />
          <vxe-column field="nameDetail" title="型号" />

          <template v-if="isCpuCompared">
            <vxe-column field="sCoreMark" title="单核" width="100" sortable>
              <template #default="{ row }">
                <span>{{ formatNum(row.sCoreMark) }}</span>
              </template>
            </vxe-column>
            <vxe-column field="mCoreMark" title="多核" width="100" sortable>
              <template #default="{ row }">
                <span>{{ formatNum(row.mCoreMark) }}</span>
              </template>
            </vxe-column>
          </template>

          <template v-else>
            <vxe-column field="mark" :title="calcMarkTitle" width="300" sortable>
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
          </template>
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/utils/setTheme.js'
import { formatNum } from '@/utils/formatNum.js'
import { timSort } from '@/utils/timSort.js'
import { isNumber } from '@/utils/isNumber.js'
import { cloneDeep, throttle } from 'lodash-es'

const props = defineProps({
  pageData: {
    type: Array,
    default: () => [],
  },
  allData: {
    type: Array,
    default: () => [],
  },
  pageConfig: {
    type: Object,
    default: () => {},
  },
  cpuCompared: {
    type: Boolean,
    default: false,
  },
})
const isDark = useDark() // 响应式：是否为暗色
const mainRef = ref() // 主体部分的 ref
const { height: innerHeight } = useElementSize(mainRef) // 响应式主体部分高度

// 返回是否是CPU综合对比
const isCpuCompared = computed(() => {
  return props.cpuCompared
})

const calcMarkTitle = computed(() => {
  if (props.pageConfig.flag === 'gpu') {
    return 'G3D Mark 得分'
  } else {
    return '性能'
  }
})

// 数据处理
let tempArr = []
// 如果是CPU对比页面
if (isCpuCompared.value) {
  const [gb6MData, gb6SData] = cloneDeep(props.allData)
  // 游戏数据Map
  const gb6SDataMap = new Map()
  gb6SData.forEach(i => {
    gb6SDataMap.set(i.nameDetail, i.mark)
  })

  // push生成单双核数组
  gb6MData.forEach(i => {
    tempArr.push({
      nameDetail: i.nameDetail,
      mCoreMark: i.mark,
      sCoreMark: gb6SDataMap.get(i.nameDetail) || 0,
    })
  })
  // 计算游戏性能最大值
  const sMaxRank = Math.max(
    ...tempArr.filter(i => isNumber(i.sCoreMark)).map(i => i.sCoreMark)
  )
  // 计算多核性能最大值
  const mMaxRank = Math.max(
    ...tempArr.filter(i => isNumber(i.mCoreMark)).map(i => i.mCoreMark)
  )

  // 根据多核性能降序排序,并设置多核排名
  timSort(tempArr, (a, b) => b.mCoreMark - a.mCoreMark)
  tempArr.forEach((i, index) => {
    i.mRank = index + 1
    i.mPercentage = parseFloat((i.mCoreMark / mMaxRank).toFixed(3))
    i.sPercentage = parseFloat((i.sCoreMark / sMaxRank).toFixed(3))
  })

  // 根据游戏性能降序排序,并设置游戏排名和key
  timSort(tempArr, (a, b) => b.sCoreMark - a.sCoreMark)
  tempArr.forEach((i, index) => {
    i.sRank = index + 1
    i.key = index
  })
} else {
  tempArr = cloneDeep(props.pageData)
  // mark不是数字的直接不要
  tempArr = tempArr.filter(i => isNumber(i.mark))

  // 计算数据中性能最大值
  const MaxRank = Math.max(...tempArr.map(i => i.mark))

  // 根据性能降序排序
  timSort(tempArr, (a, b) => b.mark - a.mark)

  // 添加排名、百分比字段
  tempArr.forEach((i, idx) => {
    i.key = idx + 1
    i.percentage = parseFloat((i.mark / MaxRank).toFixed(3))
  })
}

const originalData = Object.freeze(cloneDeep(tempArr)) // 原始数据
const tableData = ref(originalData) // 表格数据
const selectArr = ref([]) // 选中的数据
const tableRef = ref() // 表格ref

// 表格checkbox选中事件
function selectChangeEvent({ row }) {
  const index = selectArr.value.findIndex(i => i.key === row.key)
  index >= 0 ? selectArr.value.splice(index, 1) : selectArr.value.push(row)
}

// 删除右侧比较项
function removeCompareItem(key) {
  const index = selectArr.value.findIndex(i => i.key === key)
  selectArr.value.splice(index, 1)
  tableRef.value.clearCheckboxRow()
  tableRef.value.setCheckboxRow(selectArr.value, true)
}

// 返回排序后的对比数据
const calcComparedArr = computed(() => {
  const field = isCpuCompared.value ? 'mCoreMark' : 'mark'
  const arr = cloneDeep(selectArr.value)
  timSort(arr, (a, b) => b[field] - a[field])
  return arr
})

// 清空比较
function resetCompare() {
  tableRef.value.clearCheckboxRow()
  selectArr.value = []
}

const searchText = ref('') // 搜索文本

// 文字转小写并去除所有空格
function handleText(str = '') {
  return str.toLowerCase().replaceAll(' ', '')
}
watch(
  searchText,
  throttle(function () {
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
  @apply pb-16px pt-16px px-16px rounded-b-8px shadow-xl w-full min-w-500px space-y-10px bg-white  dark:(shadow-black shadow-lg bg-dark-200 text-white) lg:(rounded-8px);
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .table_main {
    filter: invert(1) hue-rotate(0.5turn) !important;
  }
}

.text_decorate {
  text-indent: 0.8em;
  @apply font-bold text-20px flex items-center leading-24px relative flex-shrink-0;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 20px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 3px;
    @apply bg-primary;
  }
}
</style>
