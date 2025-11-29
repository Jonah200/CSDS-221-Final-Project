<template>
  <div class="flex w-full mb-2">
    <div class="max-w-xs sm:max-w-md p-3 rounded-xl shadow-sm">
      <!-- Sender (optional) -->
      <p class="text-xs font-semibold text-gray-600 mb-1 name">
        {{ sender }}
      </p>

      <!-- Message text -->
      <p class="message-text">
        <slot>{{ message }}</slot>
      </p>

      <!-- Timestamp and Edited Indicator -->
      <p class="text-[10px] mt-1 opacity-70 text-right time">
        {{ formattedTime }}
        <span v-if="props.edited" class="ml-1 opacity-50">(edited)</span>
      </p>

      <div class="actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: String, required: true },
  edited: { type: Boolean, default: false },
});

const formattedTime = computed(() => {
  const date = new Date(props.timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});
</script>

<style scoped>
.message-text {
  color: #fff;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
}

.name {
  color: #fff;
}

.time {
  color: #fff;
}

.actions {
  margin-top: 6px;
  text-align: right;
  min-height: 20px;
}
</style>
