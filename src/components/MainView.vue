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
              {{ `(排名：${item.key})` }}
            </div>
            <div
              class="cursor-pointer w-16px h-16px flex items-center justify-center rounded-full transition-all hover:(text-[#f00] bg-red-100)"
              @click="removeCompareItem(item.key)"
            >
              <i class="i-material-symbols-close"></i>
            </div>
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
          <vxe-column field="key" title="排名" width="80" sortable />
          <vxe-column field="nameDetail" title="型号" />

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
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/utils/setTheme.js'
import { formatNum } from '@/utils/formatNum.js'
import { isNumber } from '@/utils/isNumber.js'
import { cloneDeep, throttle, isEqual } from 'lodash-es'

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
})
const selectionModel = defineModel('selection', {
  type: Array,
  default: () => [],
})
const isDark = useDark() // 响应式：是否为暗色
const mainRef = ref() // 主体部分的 ref
const { height: innerHeight } = useElementSize(mainRef) // 响应式主体部分高度

const calcMarkTitle = computed(() => {
  if (props.pageConfig.flag === 'gpu') {
    return 'G3D Mark 得分'
  } else {
    return '性能'
  }
})

// 数据处理

const tempArr = cloneDeep(props.pageData)
  .filter(i => isNumber(i.mark)) // 过滤非数字的mark
  .sort((a, b) => b.mark - a.mark) // 根据性能降序排序

// 如果tempArr为空，Math.max会返回-Infinity，所以需要处理这种情况
const MaxRank = tempArr.length > 0 ? tempArr[0].mark : 0

tempArr.forEach((i, idx) => {
  i.key = idx + 1
  i.percentage = parseFloat((i.mark / MaxRank).toFixed(3))
})

const originalData = Object.freeze(tempArr) // 原始数据
const tableData = ref(originalData) // 表格数据
const selectArr = ref([]) // 选中的数据
const tableRef = ref() // 表格ref
let isRestoring = false // 处于恢复全局对比状态
const NAME_FIELD = 'nameDetail' // 用于跨表格匹配名称
const nameToRowMap = new Map(originalData.map(item => [item[NAME_FIELD], item])) // 名称到行的映射

function getSelectionNames(rows = []) {
  return rows.map(item => item?.[NAME_FIELD]).filter(Boolean)
}

function updateCheckbox(rows = []) {
  if (!tableRef.value) {
    return
  }
  isRestoring = true
  tableRef.value.clearCheckboxRow()
  if (rows.length) {
    tableRef.value.setCheckboxRow(rows, true)
  }
  nextTick(() => {
    isRestoring = false
  })
}

function applySelection(rows = [], options = {}) {
  const { emitChange = false, syncCheckbox = true } = options
  const normalized = Array.isArray(rows) ? [...rows] : []
  selectArr.value = normalized
  if (syncCheckbox) {
    updateCheckbox(normalized)
  }
  if (emitChange) {
    const names = getSelectionNames(normalized)
    if (!isEqual(selectionModel.value, names)) {
      selectionModel.value = names
    }
  }
}

// 表格checkbox选中事件
function selectChangeEvent({ records = [] }) {
  if (isRestoring) {
    return
  }
  applySelection(records, { emitChange: true, syncCheckbox: false })
}

// 删除右侧比较项
function removeCompareItem(key) {
  const next = selectArr.value.filter(item => item.key !== key)
  applySelection(next, { emitChange: true })
}

// 返回排序后的对比数据
const calcComparedArr = computed(() => {
  const field = 'mark'
  const arr = cloneDeep(selectArr.value)
  arr.sort((a, b) => b[field] - a[field])
  return arr
})

// 清空比较
function resetCompare() {
  applySelection([], { emitChange: true })
}

function restoreSelectionFromGlobal(names = []) {
  if (!Array.isArray(names) || names.length === 0) {
    if (selectArr.value.length) {
      applySelection([], { syncCheckbox: true })
    } else {
      updateCheckbox([])
    }
    return
  }

  const matchedRows = []
  for (const name of names) {
    const row = nameToRowMap.get(name)
    if (!row) {
      if (selectArr.value.length) {
        applySelection([], { syncCheckbox: true })
      } else {
        updateCheckbox([])
      }
      return
    }
    matchedRows.push(row)
  }

  const currentNames = getSelectionNames(selectArr.value)
  if (!isEqual(currentNames, names)) {
    applySelection(matchedRows, { syncCheckbox: true })
  } else {
    updateCheckbox(selectArr.value)
  }
}

watch(
  selectionModel,
  newVal => {
    restoreSelectionFromGlobal(newVal)
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  nextTick(() => {
    restoreSelectionFromGlobal(selectionModel.value)
  })
})

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
    // 保持表格选中状态
    updateCheckbox(selectArr.value)
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
