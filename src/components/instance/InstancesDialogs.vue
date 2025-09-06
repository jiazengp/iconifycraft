<script setup lang="ts">
interface Instance {
  id: string
  name: string
}

defineProps<{
  showDeleteDialog: boolean
  showRenameDialog: boolean
  selectedInstance: Instance | null
}>()

defineEmits<{
  'update:showDeleteDialog': [value: boolean]
  'update:showRenameDialog': [value: boolean]
  'confirmDelete': []
  'confirmRename': [newName: string]
}>()
</script>

<template>
  <BaseConfirmDialog
    :open="showDeleteDialog"
    type="error"
    :title="$t('instances.delete.confirmTitle')"
    :description="selectedInstance ? $t('instances.delete.confirmMessage', { name: selectedInstance.name }) : ''"
    :confirm-text="$t('button.delete')"
    dangerous
    @update:open="$emit('update:showDeleteDialog', $event)"
    @confirm="$emit('confirmDelete')"
  />

  <InstanceRenameDialog
    :open="showRenameDialog"
    :current-name="selectedInstance?.name || ''"
    @update:open="$emit('update:showRenameDialog', $event)"
    @confirm="$emit('confirmRename', $event)"
  />
</template>
