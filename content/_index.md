---
title: Redirect
url: "/"
---

<script>
  const lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith("zh")) {
    window.location.href = "/zh/";
  } else {
    window.location.href = "/en/";
  }
</script>

<p>正在为您加载正确的语言页面...</p>
