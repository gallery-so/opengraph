import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = defineCloudflareConfig();

// Keep the surrounding Next server bundle on its Node export condition.
// Image generation uses workers-og explicitly; globally selecting workerd
// exports caused package-relative WASM paths to break after OpenNext bundling.
config.cloudflare = {
  ...config.cloudflare,
  useWorkerdCondition: false,
};

export default config;
