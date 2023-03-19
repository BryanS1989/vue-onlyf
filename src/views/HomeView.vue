<script setup lang="ts">
import { ref, onMounted } from 'vue';

const selectedUrl = ref('https://www.google.es');

const setUrl = () => {
    console.log('[HomeView] [setUrl()] url: ', selectedUrl.value);
    window.actions.setUrl(selectedUrl.value);
};

const showPage = () => {
    console.log('[HomeView] [showPage()]');
    window.actions.toggle(selectedUrl.value);
};

const scrollDown = () => {
    console.log('[HomeView] [scrollDown()]');
    window.actions.scrollDown();
};

onMounted(() => {});
</script>

<template>
    <main>
        <article>
            <h2>Actions over page</h2>

            <section>
                <label>
                    Select a webpage:

                    <input
                        type="url"
                        v-model="selectedUrl"
                        @focusout="setUrl"
                        style="width: 100%"
                    />
                </label>
                <button
                    @click="showPage"
                    style="width: 100%"
                >
                    Show Page
                </button>
            </section>

            <section>
                <h3>Choose your action:</h3>
                <button @click="scrollDown">Scroll Down</button>
            </section>
        </article>
    </main>
</template>
