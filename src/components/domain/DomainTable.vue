<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="domainsList"
      :loading="loader"
      class="table-default"
    >
      <template v-slot:top>
        <v-toolbar flat class="table-toolbar" height="56px">
          <v-toolbar-title>Domains</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="#03A9F4"
                dark
                class="btn-default"
                v-bind="attrs"
                v-on="on"
              >
                ADD DOMAIN
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.status"
                        label="Status"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
        <v-btn
          class="mx-2 text-capitalize btn-run"
          dark
          small
          depressed
          color="green"
          :loading="loading(item)"
          @click="runAutoClick(item)"
        >
          <v-icon x-small class="mr-2">mdi-check</v-icon>
          RUN
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script>
  import {
    createDomain,
    updateDomain,
    fetchDomainsList,
    deleteDomain,
  } from "@/database/controller/welogin.controller";

  export default {
    data: () => ({
      loader: false,
      loadings: [],
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: "Name", value: "name" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        status: "OK",
      },
      defaultItem: {
        username: "name",
        status: "OK",
      },
      domainsList: [],
    }),

    computed: {
      formTitle() {
        return this.editedIndex === -1 ? "New Item" : "Edit Item";
      },
    },

    watch: {
      dialog(val) {
        val || this.close();
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
    },

    async created() {
      await this.fetchDomain();
    },

    methods: {
      async runAutoClick(item) {
        const proxy = {
          name: item.name,
          url: item["ProxyId"]
            ? `${item["Proxy.type"]}://${item["Proxy.ipport"]}`
            : "",
          username: "",
          password: "",
          profileName: item.name,
          userAgent: item.userAgent,
        };
        await window.ipcRenderer.invoke("connectWithExtra1", proxy);
      },
      async fetchDomain() {
        this.loader = true;
        this.domainsList = await fetchDomainsList();
        console.log(this.domainsList);
        this.loader = false;
      },
      loading(item) {
        return this.loadings.includes(item);
      },

      editItem(item) {
        this.editedIndex = this.domainsList.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialog = true;
      },

      deleteItem(item) {
        this.editedIndex = this.domainsList.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialogDelete = true;
      },

      async deleteItemConfirm() {
        this.deleteDomain(this.editedItem);
        this.fetchDomain();
        this.closeDelete();
      },

      close() {
        this.dialog = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      closeDelete() {
        this.dialogDelete = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },
      async deleteDomain(domain) {
        await deleteDomain(domain).then(
          function (rowDeleted) {
            if (rowDeleted === 1) {
              console.log("Deleted successfully");
            }
          },
          function (err) {
            console.log(err);
          }
        );
        await fetchDomainsList();
      },
      async save() {
        console.log("Saved successfully");
        if (this.editedIndex > -1) {
          console.log(this.editedItem);
          await updateDomain(this.editedItem);
        } else {
          console.log("Creating item", this.editedItem);
          try {
            await createDomain(this.editedItem);
          } catch (error) {
            console.log(error);
          }
        }
        this.fetchDomain();
        this.close();
      },
    },
  };
</script>
<style lang="scss" scoped>
  .table-toolbar {
    ::v-deep .v-toolbar__content {
      padding: 0px !important;
    }
  }
  .btn-check {
    &:hover {
      cursor: pointer;
      background-color: rgba(5, 175, 115, 0.523) !important;
    }
  }
  .status {
    color: #fff;
    font-size: 12px;
  }
</style>
