import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInstanceManager } from '~/composables/useInstanceManager'
import { useLocalizedRouter } from '~/composables/useLocalizedRouter'

export function useInstanceDetail() {
  const route = useRoute('/instances/[id]')
  const { pushLocalized } = useLocalizedRouter()
  const { loadInstance, currentInstance, loading } = useInstanceManager()

  const instanceId = computed(() => route.params.id as string)

  const loadInstanceData = async () => {
    const success = await loadInstance(instanceId.value)
    if (!success) {
      await pushLocalized('/instances')
    }
  }

  onMounted(() => {
    if (instanceId.value) {
      loadInstanceData()
    }
  })

  return {
    currentInstance,
    loading,
  }
}
