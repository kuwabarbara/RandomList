<script setup>
import { ref, computed, onMounted } from "vue";
import { addIdea, watchIdeas, markDone, removeIdea } from "./firebase";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";

const ideas = ref([]);
const newIdea = ref("");
const picked = ref(null);
const unsub = ref(null);

onMounted(async () => {

  console.log("projectId:", getApp().options.projectId);
  // Firestoreを購読
  unsub.value = watchIdeas(
    (list) => { ideas.value = list; },
    (err) => {
      console.error("onSnapshot error:", err);
      alert("読み込みに失敗しました: " + (err?.message || err));
    }
  );
});

function beforeUnmount() { if (unsub.value) unsub.value(); }

async function addIdeaAction() {
  const t = newIdea.value.trim();
  if (!t) return;
  try {
    await addIdea(t);
    newIdea.value = "";
  } catch (e) {
    console.error("addIdea failed:", e);
    alert("追加できませんでした: " + (e?.message || e));
  }
}

function sampleRandom() {
  const left = ideas.value.filter(i => !i.done);
  if (left.length === 0) { picked.value = { text: "未消化がありません！追加してね" }; return; }
  const idx = Math.floor(Math.random() * left.length);
  picked.value = left[idx];
}

async function toggleDone(i) {
  try {
    await markDone(i.id, !i.done);
  } catch (e) {
    console.error("markDone failed:", e);
    alert("更新できませんでした: " + (e?.message || e));
  }
}

async function deleteIdea(i) {
  if (!confirm("削除しますか？")) return;
  try {
    await removeIdea(i.id);
    if (picked.value?.id === i.id) picked.value = null;
  } catch (e) {
    console.error("removeIdea failed:", e);
    alert("削除できませんでした: " + (e?.message || e));
  }
}

const leftCount = computed(() => ideas.value.filter(i => !i.done).length);
</script>

<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-3">やりたいことランダム</h1>

    <div class="border p-3 rounded">
      <h2 class="font-semibold mb-2">やりたいことを追加</h2>
      <div class="flex gap-2">
        <input v-model="newIdea" placeholder="例: 夜景ドライブ"
               class="border rounded px-2 py-1 flex-1" @keyup.enter="addIdeaAction" />
        <button @click="addIdeaAction" class="bg-black text-white rounded px-3 py-1">追加</button>
      </div>
    </div>

    <div class="border p-3 rounded space-y-3 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">未消化リスト（{{ leftCount }}）</h2>
        <button @click="sampleRandom" class="bg-emerald-600 text-white rounded px-3 py-1">
          ランダム決定
        </button>
      </div>

      <div v-if="picked" class="bg-emerald-50 border border-emerald-200 p-3 rounded">
        <div class="text-sm text-gray-600 mb-1">今日のやること</div>
        <div class="text-lg font-semibold">{{ picked.text }}</div>
      </div>

      <ul class="space-y-2">
        <li v-for="i in ideas" :key="i.id" class="flex items-center gap-2">
          <input type="checkbox" :checked="i.done" @change="toggleDone(i)" />
          <span :class="i.done ? 'line-through text-gray-400' : ''">{{ i.text }}</span>
          <button class="ml-auto text-sm underline" @click="deleteIdea(i)">削除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; }
.max-w-xl { max-width: 40rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.p-4 { padding: 1rem; }
.mb-3 { margin-bottom: .75rem; }
.mt-4 { margin-top: 1rem; }
.space-y-2 > * + * { margin-top: .5rem; }
.space-y-3 > * + * { margin-top: .75rem; }
.border { border: 1px solid #ddd; }
.rounded { border-radius: .5rem; }
.flex { display:flex; }
.items-center { align-items:center; }
.justify-between { justify-content:space-between; }
.gap-2 { gap:.5rem; }
.text-gray-600 { color:#555; }
.text-gray-400 { color:#888; }
.text-2xl { font-size:1.5rem; }
.font-bold { font-weight:700; }
.font-semibold { font-weight:600; }
.bg-black { background:#000; }
.bg-emerald-50 { background:#ecfdf5; }
.border-emerald-200 { border-color:#a7f3d0; }
.bg-emerald-600 { background:#059669; }
.text-white { color:#fff; }
.px-3 { padding-left:.75rem; padding-right:.75rem; }
.py-1 { padding-top:.25rem; padding-bottom:.25rem; }
.underline { text-decoration: underline; }
.ml-auto { margin-left:auto; }
.flex-1 { flex: 1 1 auto; }
.w-full { width: 100%; }
</style>
