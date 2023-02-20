<template>
  <div class="chart" ref="chartRef"></div>
</template>

<script setup>
import * as echarts from 'echarts';
import {ref, onMounted, onUnmounted} from "vue";

let chartRef = ref();
let myChart;

onUnmounted(() => {
  myChart.dispose();
  myChart = null;
});

onMounted(() => {
  myChart = echarts.init(chartRef.value);
  const option = {
    tooltip: {
      trigger: 'item'
    },
    color: ['#ffd666', '#ffa39e', '#409eff'],
    // 数据
    series: [
      {
        name: '前端课程',
        type: 'pie',
        data: [
          {value: 43340, name: '重学前端'},
          {value: 7003, name: 'JavaScript核心原理解析'},
          {value: 4314, name: '玩转vue3全家桶'}
        ]
      }
    ]
  };
  myChart.setOption(option);
});
</script>

<style>
.chart {
  height: 300px;
}
</style>
