import { ref, computed } from 'vue';

const isSidebarOpen = ref(false);

export function useSidebar() {
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const openSidebar = () => {
    isSidebarOpen.value = true;
  };

  const sidebarWidth = computed(() => {
    return isSidebarOpen.value ? '260px' : '60px';
  });

  const contentMarginLeft = computed(() => {
    return isSidebarOpen.value ? '260px' : '60px';
  });

  const contentWidth = computed(() => {
    return isSidebarOpen.value ? 'calc(100vw - 260px)' : 'calc(100vw - 60px)';
  });

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    sidebarWidth,
    contentMarginLeft,
    contentWidth
  };
}
