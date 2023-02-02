import {ref, watch} from "vue";

export function useFavicon(newIcon) {
    const favicon = ref(newIcon);

    const updateIcon = (icon) => {
      document.head
          .querySelectorAll(`link[rel*="icon"]`)
          .forEach(el => el.href = icon);
    }

    const reset = () => {
      favicon.value = '/favicon.ico'
    }

    watch(favicon, i => {
        // i获取的是favicon的value值
        updateIcon(i);
    });

    return {
        favicon,
        reset
    }
}
