<script setup lang="ts">
import { ref, onMounted } from 'vue';

const selectedUrl = ref('https://www.google.es');
const secondsToScroll = ref(1);
const clickedElementInfo = ref({
    className: '',
    id: '',
    innerHTML: '',
    innerText: '',
    localName: '',
    nodeName: '',
    outerHTML: '',
    outerText: '',
    tagName: '',
    textContent: '',
});

const setUrl = () => {
    console.log('[HomeView] [setUrl()] url: ', selectedUrl.value);
    window.actions.setUrl(selectedUrl.value);
};

const showPage = () => {
    console.log('[HomeView] [showPage()]');
    window.actions.toggle(selectedUrl.value);
};

const scrollDown = () => {
    console.log(
        '[HomeView] [scrollDown()] ' + secondsToScroll.value + ' seconds'
    );
    window.actions.scrollDown(secondsToScroll.value * 1000);
};

onMounted(() => {
    window.actions.onClickedElement((_event, target) => {
        console.log(target);

        clickedElementInfo.value = target;
    });
});
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
                <label>
                    Scroll time in seconds:
                    <input
                        type="number"
                        v-model="secondsToScroll"
                        min="1"
                        max="60"
                    />
                </label>
                <button @click="scrollDown">Scroll Down</button>
            </section>
        </article>
    </main>
</template>
