<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { ResourcePack } from '~/types/resource-pack'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useResourcePackStore } from '~/stores/resource-pack'

const packStore = useResourcePackStore()

// 响应式状态
const showConflictsOnly = ref(false)
const highlightedPack = ref<string | null>(null)
const activeMenu = ref<string | null>(null)
const packRefs = ref<Record<number, HTMLElement>>({})

// 计算属性
const inheritanceOrder = computed(() => {
  const order = packStore.inheritanceOrder
  return showConflictsOnly.value
    ? order.filter((pack: ResourcePack) => getPackConflicts(pack.id).length > 0)
    : order
})

const conflicts = computed(() => packStore.inheritance.conflicts)

const topConflicts = computed(() =>
  conflicts.value
    .slice()
    .sort((a: { packs: string[] }, b: { packs: string[] }) => b.packs.length - a.packs.length)
    .slice(0, 5),
)

const connectionLines = computed(() => {
  const lines: Array<{ x1: number, y1: number, x2: number, y2: number }> = []

  // 计算连接线的坐标
  for (let i = 0; i < inheritanceOrder.value.length - 1; i++) {
    const currentEl = packRefs.value[i]
    const nextEl = packRefs.value[i + 1]

    if (currentEl && nextEl) {
      const currentRect = currentEl.getBoundingClientRect()
      const nextRect = nextEl.getBoundingClientRect()

      lines.push({
        x1: currentRect.left + currentRect.width / 2,
        y1: currentRect.bottom,
        x2: nextRect.left + nextRect.width / 2,
        y2: nextRect.top,
      })
    }
  }

  return lines
})

// 方法
function setPackRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el && el instanceof HTMLElement) {
    packRefs.value[index] = el
  }
}

function getPackConflicts(packId: string) {
  const pack = packStore.getPackById(packId)
  if (!pack)
    return []

  return conflicts.value.filter(conflict =>
    conflict.packs.includes(pack.name),
  )
}

function highlightPack(packId: string | null) {
  highlightedPack.value = packId
}

function togglePackMenu(packId: string) {
  activeMenu.value = activeMenu.value === packId ? null : packId
}

function showPackDetails(_pack: ResourcePack) {
  // 实现显示材质包详情的逻辑
  // TODO: 实现详情对话框
  activeMenu.value = null
}

function showPackTextures(_pack: ResourcePack) {
  // 实现显示材质包材质的逻辑
  // TODO: 实现材质列表对话框
  activeMenu.value = null
}

function showPackConflictsDialog(_pack: ResourcePack) {
  // 实现显示冲突对话框的逻辑
  // TODO: 实现冲突解决对话框
  activeMenu.value = null
}

function removePack(packId: string) {
  packStore.removePack(packId)
  activeMenu.value = null
}

function refreshVisualization() {
  nextTick(() => {
    // 重新计算连接线
    packRefs.value = {}
  })
}

// 生命周期
onMounted(() => {
  refreshVisualization()
})
</script>

<template>
  <div class="inheritance-visualizer">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">
          材质包继承层级
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          显示材质包的加载顺序和材质覆盖关系
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          class="border border-gray-300 rounded px-3 py-1 text-xs dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="showConflictsOnly = !showConflictsOnly"
        >
          {{ showConflictsOnly ? '显示全部' : '仅显示冲突' }}
        </button>
        <button
          class="border border-gray-300 rounded px-3 py-1 text-xs dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="refreshVisualization"
        >
          <i class="i-carbon-reset mr-1" />
          刷新
        </button>
      </div>
    </div>

    <!-- 继承层级图 -->
    <div class="inheritance-tree mb-6">
      <div class="relative">
        <!-- 连接线 -->
        <div class="pointer-events-none absolute inset-0">
          <svg class="h-full w-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6B7280"
                />
              </marker>
            </defs>
            <line
              v-for="(line, index) in connectionLines"
              :key="index"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
              stroke="#6B7280"
              stroke-width="2"
              stroke-dasharray="5,5"
              marker-end="url(#arrowhead)"
            />
          </svg>
        </div>

        <!-- 材质包节点 -->
        <div class="relative space-y-4">
          <div
            v-for="(pack, index) in inheritanceOrder"
            :key="pack.id"
            :ref="el => setPackRef(el, index)"
            class="pack-node"
            :class="{
              'pack-node--vanilla': pack.isVanilla,
              'pack-node--custom': !pack.isVanilla,
              'pack-node--highlight': highlightedPack === pack.id,
            }"
            @mouseenter="highlightPack(pack.id)"
            @mouseleave="highlightPack(null)"
          >
            <div class="flex items-center justify-between border border-gray-200 rounded-lg bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div class="flex items-center">
                <div class="priority-badge">
                  {{ index + 1 }}
                </div>

                <div class="ml-3 flex-1">
                  <div class="flex items-center">
                    <h4 class="font-medium">
                      {{ pack.name }}
                    </h4>
                    <div v-if="pack.isVanilla" class="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      原版
                    </div>
                  </div>

                  <div class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{{ pack.textures.length }} 个材质</span>
                    <span class="mx-2">•</span>
                    <span>{{ getPackConflicts(pack.id).length }} 个冲突</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  @click="showPackDetails(pack)"
                >
                  <i class="i-carbon-information" />
                </button>

                <div class="relative">
                  <button
                    class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    @click="togglePackMenu(pack.id)"
                  >
                    <i class="i-carbon-overflow-menu-vertical" />
                  </button>

                  <div
                    v-if="activeMenu === pack.id"
                    class="absolute right-0 top-full z-10 mt-1 w-48 border border-gray-200 rounded-lg bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <button
                      class="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      @click="showPackTextures(pack)"
                    >
                      <i class="i-carbon-image mr-2" />
                      查看材质
                    </button>
                    <button
                      class="w-full flex items-center px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      @click="showPackConflictsDialog(pack)"
                    >
                      <i class="i-carbon-warning mr-2" />
                      查看冲突
                    </button>
                    <div class="border-t border-gray-200 dark:border-gray-700" />
                    <button
                      v-if="!pack.isVanilla"
                      class="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      @click="removePack(pack.id)"
                    >
                      <i class="i-carbon-trash-can mr-2" />
                      移除材质包
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 冲突指示器 -->
            <div v-if="getPackConflicts(pack.id).length > 0" class="mt-2">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="conflict in getPackConflicts(pack.id).slice(0, 3)"
                  :key="conflict.textureId"
                  class="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                >
                  {{ conflict.textureId.split(':')[1] }}
                </span>
                <span
                  v-if="getPackConflicts(pack.id).length > 3"
                  class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                  +{{ getPackConflicts(pack.id).length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 冲突统计 -->
    <div v-if="conflicts.length > 0" class="conflicts-summary">
      <div class="border border-yellow-200 rounded-lg bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-yellow-800 font-medium dark:text-yellow-200">
            材质冲突统计
          </h4>
          <span class="text-sm text-yellow-600 dark:text-yellow-400">
            {{ conflicts.length }} 个冲突
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h5 class="mb-2 text-sm text-yellow-800 font-medium dark:text-yellow-200">
              高冲突材质
            </h5>
            <div class="space-y-1">
              <div
                v-for="conflict in topConflicts"
                :key="conflict.textureId"
                class="flex justify-between text-sm"
              >
                <span class="text-yellow-700 dark:text-yellow-300">
                  {{ conflict.textureId.split(':')[1] }}
                </span>
                <span class="text-yellow-600 dark:text-yellow-400">
                  {{ conflict.packs.length }} 个包
                </span>
              </div>
            </div>
          </div>

          <div>
            <h5 class="mb-2 text-sm text-yellow-800 font-medium dark:text-yellow-200">
              解决建议
            </h5>
            <ul class="text-sm text-yellow-700 space-y-1 dark:text-yellow-300">
              <li>• 调整材质包优先级</li>
              <li>• 移除重复的材质包</li>
              <li>• 使用专门的材质覆盖</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.priority-badge {
  @apply w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium;
}

.pack-node {
  @apply transition-all duration-200;
}

.pack-node--highlight {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.pack-node--vanilla {
  @apply relative;
}

.pack-node--vanilla::before {
  content: '';
  @apply absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg -z-10;
}

.conflicts-summary {
  @apply animate-fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
