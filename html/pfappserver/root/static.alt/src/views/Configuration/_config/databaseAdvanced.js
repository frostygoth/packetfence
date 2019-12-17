import i18n from '@/utils/locale'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormInput from '@/components/pfFormInput'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'

export const view = (form = {}, meta = {}) => {
  return [
    {
      tab: null,
      rows: [
        {
          label: i18n.t('Key buffer size'),
          text: i18n.t('The key_buffer_size MySQL configuration attribute (in MB). Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'key_buffer_size',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'key_buffer_size')
            }
          ]
        },
        {
          label: i18n.t('InnoDB buffer pool size'),
          text: i18n.t('The innodb_buffer_pool_size MySQL configuration attribute (in MB). Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'innodb_buffer_pool_size',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'innodb_buffer_pool_size')
            }
          ]
        },
        {
          label: i18n.t('InnoDB additionnal mem pool size'),
          text: i18n.t('The innodb_additional_mem_pool_size MySQL configuration attribute (in MB). Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'innodb_additional_mem_pool_size',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'innodb_additional_mem_pool_size')
            }
          ]
        },
        {
          label: i18n.t('Query cache size'),
          text: i18n.t('The query_cache_size MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'query_cache_size',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'query_cache_size')
            }
          ]
        },
        {
          label: i18n.t('Thread concurrency'),
          text: i18n.t('The thread_concurrency MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'thread_concurrency',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'thread_concurrency')
            }
          ]
        },
        {
          label: i18n.t('Max connections'),
          text: i18n.t('The max_connections MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'max_connections',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'max_connections')
            }
          ]
        },
        {
          label: i18n.t('Table cache'),
          text: i18n.t('The table_cache MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'table_cache',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'table_cache')
            }
          ]
        },
        {
          label: i18n.t('Thread cache size'),
          text: i18n.t('The thread_cache_size MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'thread_cache_size',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'thread_cache_size')
            }
          ]
        },
        {
          label: i18n.t('Max allowed packets'),
          text: i18n.t('The max_allowed_packet MySQL configuration attribute (in MB). Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'max_allowed_packet',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'max_allowed_packet')
            }
          ]
        },
        {
          label: i18n.t('Performance schema'),
          text: i18n.t('The performance_schema MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'performance_schema',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'performance_schema')
            }
          ]
        },
        {
          label: i18n.t('Max connect errors'),
          text: i18n.t('The max_connect_errors MySQL configuration attribute. Only change if you know what you are doing. Will only affect a locally running MySQL server.'),
          cols: [
            {
              namespace: 'max_connect_errors',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'max_connect_errors')
            }
          ]
        },
        {
          label: i18n.t('Master/Slave mode'),
          text: i18n.t('Enable master/slave replication.'),
          cols: [
            {
              namespace: 'masterslave',
              component: pfFormChosen,
              attrs: pfConfigurationAttributesFromMeta(meta, 'masterslave')
            }
          ]
        },
        {
          label: i18n.t('Other MySQL Servers'),
          text: i18n.t('Comma delimited IPv4 address of other member MySQL members - used to sync the database.'),
          cols: [
            {
              namespace: 'other_members',
              component: pfFormInput,
              attrs: pfConfigurationAttributesFromMeta(meta, 'other_members')
            }
          ]
        }
      ]
    }
  ]
}

export const validators = (form = {}, meta = {}) => {
  return {
    key_buffer_size: pfConfigurationValidatorsFromMeta(meta, 'key_buffer_size', i18n.t('Size')),
    innodb_buffer_pool_size: pfConfigurationValidatorsFromMeta(meta, 'innodb_buffer_pool_size', i18n.t('Size')),
    innodb_additional_mem_pool_size: pfConfigurationValidatorsFromMeta(meta, 'innodb_additional_mem_pool_size', i18n.t('Size')),
    query_cache_size: pfConfigurationValidatorsFromMeta(meta, 'query_cache_size', i18n.t('Size')),
    thread_concurrency: pfConfigurationValidatorsFromMeta(meta, 'thread_concurrency', i18n.t('Concurrency')),
    max_connections: pfConfigurationValidatorsFromMeta(meta, 'max_connections', i18n.t('Connections')),
    table_cache: pfConfigurationValidatorsFromMeta(meta, 'table_cache', i18n.t('Cache')),
    thread_cache_size: pfConfigurationValidatorsFromMeta(meta, 'thread_cache_size', i18n.t('Size')),
    max_allowed_packet: pfConfigurationValidatorsFromMeta(meta, 'max_allowed_packet', i18n.t('Packets')),
    performance_schema: pfConfigurationValidatorsFromMeta(meta, 'performance_schema', i18n.t('Schema')),
    max_connect_errors: pfConfigurationValidatorsFromMeta(meta, 'max_connect_errors', i18n.t('Errors')),
    masterslave: pfConfigurationValidatorsFromMeta(meta, 'masterslave', i18n.t('Mode')),
    other_members: pfConfigurationValidatorsFromMeta(meta, 'other_members', 'Other MySQL Servers')
  }
}
