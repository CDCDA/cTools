<!--
 * @Description:  svg图标
-->
<template>
  <svg :class="'svg-icon ' + ($attrs.iconClass ? $attrs.iconClass : '')" aria-hidden="true">
    <use class="svg-use theme-icon" :href="'#' + $attrs.iconName" />
  </svg>
</template>

<script setup lang="ts"></script>

<style>
use {
  width: 100%;
  height: 100%;
}
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
