<template>
  <pf-config-list
    ref="pfConfigList"
    :config="config"
  >
    <template v-slot:buttonAdd>
      <b-dropdown :text="$t('New Switch')" variant="outline-primary">
        <b-dropdown-header class="text-secondary">{{ $t('To group') }}</b-dropdown-header>
          <b-dropdown-item v-for="(switchGroup, index) in switchGroups" :key="index"
            :to="{ name: 'newSwitch', params: { switchGroup: switchGroup.id } }">{{ switchGroup.id }}</b-dropdown-item>
      </b-dropdown>
    </template>
    <template v-slot:emptySearch="state">
      <pf-empty-table :isLoading="state.isLoading">{{ $t('No switches found') }}</pf-empty-table>
    </template>
    <template v-slot:cell(buttons)="item">
      <span class="float-right text-nowrap text-right">
        <pf-button-delete size="sm" v-if="!item.not_deletable" variant="outline-danger" class="mr-1" :disabled="isLoading" :confirm="$t('Delete Switch?')" @on-delete="remove(item)" reverse/>
        <b-button size="sm" variant="outline-primary" class="mr-1" @click.stop.prevent="clone(item)">{{ $t('Clone') }}</b-button>
      </span>
    </template>
  </pf-config-list>
</template>

<script>
import pfButtonDelete from '@/components/pfButtonDelete'
import pfConfigList from '@/components/pfConfigList'
import pfEmptyTable from '@/components/pfEmptyTable'
import {
  pfConfigurationSwitchesListConfig as config
} from '@/globals/configuration/pfConfigurationSwitches'

export default {
  name: 'switches-list',
  components: {
    pfButtonDelete,
    pfConfigList,
    pfEmptyTable
  },
  props: {
    storeName: { // from router
      type: String,
      default: null,
      required: true
    }
  },
  data () {
    return {
      switchGroups: [], // all switches
      config: config(this)
    }
  },
  methods: {
    init () {
      this.$store.dispatch('$_switch_groups/all').then(data => {
        this.switchGroups = data
      })
    },
    clone (item) {
      this.$router.push({ name: 'cloneSwitch', params: { id: item.id } })
    },
    remove (item) {
      this.$store.dispatch(`${this.storeName}/deleteSwitch`, item.id).then(response => {
        const { $refs: { pfConfigList: { refreshList = () => {} } = {} } = {} } = this
        refreshList() // soft reload
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
