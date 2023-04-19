<template>
  <v-container fluid class="pa-6">
    <domain-table></domain-table>
  </v-container>
</template>
<script>
  import DomainTable from "@/components/domain/DomainTable.vue";

  export default {
    name: "Domains",
    components: {
      DomainTable,
    },
  };
</script>
