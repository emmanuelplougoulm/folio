<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  FBadge,
  FBreadcrumb,
  FButton,
  FCard,
  FRadioGroup,
  useToast
} from '@emmanuelplougoulm/folio';
import {
  LATEST_VERSION,
  PROCESS,
  PROCESS_VERSIONS,
  defaultVersion,
  type ProcessVersion
} from '../order/process';
import { draft, isPristine } from '../order/draft';
import { formatDay } from '../order/format';
import type { Locale } from '../i18n';

const { t, locale } = useI18n();
const toast = useToast();

const breadcrumb = computed(() => [
  {
    label: t('home.breadcrumb'),
    link: { to: { name: 'home', params: { locale: locale.value } } }
  },
  { label: t('process.title') }
]);

const choice = ref<ProcessVersion>(defaultVersion.value);
const options = computed(() =>
  PROCESS_VERSIONS.map((version) => ({
    value: version,
    label: t(`process.versions.${version}`),
    description: t(`process.summaries.${version}`)
  }))
);

/** Une commande commencée garde sa version : on le signale quand elle diffère du réglage. */
const inProgress = computed(() =>
  isPristine(draft) ? null : t(`process.versions.${draft.processVersion}`)
);

// Les plus récentes d'abord, comme des notes de version.
const releases = computed(() =>
  [...PROCESS_VERSIONS].reverse().map((version) => ({
    version,
    ...PROCESS[version],
    released: formatDay(PROCESS[version].releasedOn, locale.value as Locale),
    steps: PROCESS[version].steps.map((step) => t(`order.steps.${step}`)).join(' → ')
  }))
);

function onSave() {
  defaultVersion.value = choice.value;
  toast.show({
    title: t('process.saved', { version: t(`process.versions.${choice.value}`) }),
    tone: 'success'
  });
}
</script>

<template>
  <FBreadcrumb
    :items="breadcrumb"
    :label="t('app.breadcrumb')"
    :as="RouterLink"
    class="tb-breadcrumb"
  />
  <h1 class="tb-title">{{ t('process.title') }}</h1>
  <p class="tb-lead">{{ t('process.intro') }}</p>

  <form class="tb-process__settings" @submit.prevent="onSave">
    <FRadioGroup
      id="processVersion"
      v-model="choice"
      :legend="t('process.legend')"
      :hint="t('process.hint')"
      :options="options"
    />
    <p v-if="inProgress" class="tb-process__note">
      {{ t('process.inProgress', { version: inProgress }) }}
    </p>
    <div>
      <FButton type="submit" variant="primary">{{ t('process.save') }}</FButton>
    </div>
  </form>

  <h2 class="tb-process__heading">{{ t('process.releasesTitle') }}</h2>
  <div class="tb-process__releases">
    <FCard
      v-for="release in releases"
      :key="release.version"
      as="article"
      :title="t(`process.versions.${release.version}`)"
      :heading-level="3"
    >
      <template #headerAction>
        <FBadge :tone="release.version === LATEST_VERSION ? 'success' : 'neutral'">
          {{
            release.version === LATEST_VERSION
              ? t('process.status.current')
              : t('process.status.maintained')
          }}
        </FBadge>
      </template>
      <p class="tb-process__meta">
        {{ t('process.releasedOn', { date: release.released }) }}
      </p>
      <p class="tb-process__meta">
        {{ t('process.stepsLabel', { steps: release.steps }) }}
      </p>
      <ul class="tb-process__changes">
        <li v-for="change in release.changes" :key="change.ticket">
          <code class="tb-code">{{ change.ticket }}</code>
          {{ t(`process.changes.${change.key}`) }}
        </li>
      </ul>
    </FCard>
  </div>
</template>

<style>
.tb-process__settings {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-4);
  margin-block: var(--f-space-6) var(--f-space-10);
}

.tb-process__note {
  margin: 0;
  color: var(--f-color-text-muted);
}

.tb-process__heading {
  margin-block: 0 var(--f-space-4);
  font-family: var(--f-font-family-serif);
  font-size: var(--f-font-size-xl);
  font-weight: var(--f-font-weight-medium);
}

.tb-process__releases {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-6);
}

.tb-process__meta {
  margin: 0 0 var(--f-space-2);
  color: var(--f-color-text-muted);
}

.tb-process__changes {
  display: flex;
  flex-direction: column;
  gap: var(--f-space-2);
  padding-inline-start: var(--f-space-5);
  margin: var(--f-space-4) 0 0;
}
</style>
