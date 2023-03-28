<script setup lang="ts">
import { ref, onMounted } from 'vue';

const selectedUrl = ref('https://www.google.es');
const secondsToScroll = ref(1);
const clickedElementInfo = ref({
    // className: '',
    // id: '',
    // innerHTML: '',
    // innerText: '',
    // localName: '',
    // nodeName: '',
    // outerHTML: '',
    // outerText: '',
    // tagName: '',
    // textContent: '',
});
const numberOfOcurrences = ref(0);

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

const selectElement = () => {
    console.log('[HomeView] [selectElement()] ');
    window.actions.selectElement();
};

const countSelectedElement = () => {
    console.log('[HomeView] [countSelectedElement()] ');

    let cssQuerySelector = '';

    if (
        clickedElementInfo.value.tagName &&
        clickedElementInfo.value.tagName !== ''
    ) {
        cssQuerySelector += `${clickedElementInfo.value.tagName.toLowerCase()}`;
    }

    if (
        clickedElementInfo.value.className &&
        clickedElementInfo.value.className !== ''
    ) {
        let classes = clickedElementInfo.value.className.replace(' ', '.');
        cssQuerySelector += `.${classes}`;
    }

    window.actions.countElements(cssQuerySelector).then((response) => {
        console.log('[HomeView] [countSelectedElement()] response: ', response);
        // numberOfOcurrences
    });
};

const clearElement = () => {
    clickedElementInfo.value = {};
};

onMounted(() => {
    window.actions.onClickedElement((_event, target) => {
        console.log(
            '[HomeView] [onMounted] [onClickedElement] target: ',
            target
        );

        clickedElementInfo.value = target;

        countSelectedElement();
    });

    window.actions.onCountedElement((_event, target) => {
        console.log(
            '[HomeView] [onMounted] [onCountedElement] target: ',
            target
        );

        numberOfOcurrences.value = target;
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

            <article>
                <h3>Choose your action:</h3>

                <section>
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

                <section>
                    <button @click="selectElement">Select an Element</button>
                    <button
                        v-if="Object.keys(clickedElementInfo).length !== 0"
                        @click="clearElement"
                    >
                        Clear Element
                    </button>
                    <dl v-if="Object.keys(clickedElementInfo).length !== 0">
                        <dt>Number of occurrences:</dt>
                        <dd>
                            {{ numberOfOcurrences }}
                        </dd>
                    </dl>
                    <dl
                        v-for="(info, index) in Object.keys(clickedElementInfo)"
                        :key="index"
                    >
                        <dt>{{ info }} :</dt>

                        <dd v-if="!['innerHTML', 'outerHTML'].includes(info)">
                            {{ clickedElementInfo[info] }}
                        </dd>
                        <dd v-if="['innerHTML', 'outerHTML'].includes(info)">
                            <span v-html="clickedElementInfo[info]"></span>
                        </dd>
                    </dl>
                </section>
            </article>

            <hr />
        </article>
    </main>
</template>
