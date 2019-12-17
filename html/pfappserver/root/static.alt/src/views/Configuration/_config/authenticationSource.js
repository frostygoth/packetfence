/* eslint-disable camelcase */
import store from '@/store'
import i18n from '@/utils/locale'
import pfFieldTypeValue from '@/components/pfFieldTypeValue'
import pfFieldAttributeOperatorValue from '@/components/pfFieldAttributeOperatorValue'
import pfFieldRule from '@/components/pfFieldRule'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormFields from '@/components/pfFormFields'
import pfFormHtml from '@/components/pfFormHtml'
import pfFormInput from '@/components/pfFormInput'
import pfFormInputMultiple from '@/components/pfFormInputMultiple'
import pfFormPassword from '@/components/pfFormPassword'
import pfFormRangeToggle from '@/components/pfFormRangeToggle'
import pfFormTextarea from '@/components/pfFormTextarea'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationAuthenticationSourceRulesConditionFieldsFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import { pfActions } from '@/globals/pfActions'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  alphaNum,
  and,
  not,
  conditional,
  hasSources,
  sourceExists
} from '@/globals/pfValidators'
import {
  maxLength,
  required
} from 'vuelidate/lib/validators'

export const columns = [
  {
    key: 'id',
    label: i18n.t('Name'),
    required: true,
    sortable: true,
    visible: true
  },
  {
    key: 'description',
    label: i18n.t('Description'),
    sortable: true,
    visible: true
  },
  {
    key: 'type',
    label: i18n.t('Type'),
    sortable: true,
    visible: true
  },
  {
    key: 'buttons',
    label: '',
    locked: true
  }
]

export const fields = [
  {
    value: 'id',
    text: i18n.t('Name'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'description',
    text: i18n.t('Description'),
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: i18n.t('Type'),
    types: [conditionType.SUBSTRING]
  }
]

export const config = () => {
  return {
    columns,
    fields,
    rowClickRoute (item) {
      return { name: 'source', params: { id: item.id } }
    },
    searchPlaceholder: i18n.t('Search by name or description'),
    searchableOptions: {
      searchApiEndpoint: 'config/sources',
      defaultSortKeys: ['id'],
      defaultSearchCondition: {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: null },
            { field: 'description', op: 'contains', value: null },
            { field: 'class', op: 'contains', value: null },
            { field: 'type', op: 'contains', value: null }
          ]
        }]
      },
      defaultRoute: { name: 'sources' },
      resultsFilter: (results) => results.filter(item => item.id !== 'local') // ignore 'local' source
    },
    searchableQuickCondition: (quickCondition) => {
      return {
        op: 'and',
        values: [{
          op: 'or',
          values: [
            { field: 'id', op: 'contains', value: quickCondition },
            { field: 'description', op: 'contains', value: quickCondition },
            { field: 'class', op: 'contains', value: quickCondition },
            { field: 'type', op: 'contains', value: quickCondition }
          ]
        }]
      }
    }
  }
}

export const viewFields = {
  id: (form = {}, meta = {}) => {
    const { isNew = false, isClone = false } = meta
    return {
      label: i18n.t('Name'),
      cols: [
        {
          namespace: 'id',
          component: pfFormInput,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'id'),
            ...{
              disabled: (!isNew && !isClone)
            }
          }
        }
      ]
    }
  },
  access_scope: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Scope'),
      text: i18n.t('The permissions the application requests.'),
      cols: [
        {
          namespace: 'scope',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'scope')
        }
      ]
    }
  },
  access_token_param: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Access Token Parameter'),
      cols: [
        {
          namespace: 'access_token_param',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'access_token_param')
        }
      ]
    }
  },
  access_token_path: (form = {}, meta = {}) => {
    return {
      label: null, // multiple occurances w/ different strings, nullify for overload
      cols: [
        {
          namespace: 'access_token_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'access_token_path')
        }
      ]
    }
  },
  account_sid: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Account SID'),
      text: i18n.t('Twilio Account SID.'),
      cols: [
        {
          namespace: 'account_sid',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'account_sid')
        }
      ]
    }
  },
  activation_domain: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Host in activation link'),
      text: i18n.t('Set this value if you want to change the hostname in the validation link. Changing this requires to restart haproxy to be fully effective.'),
      cols: [
        {
          namespace: 'activation_domain',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'activation_domain')
        }
      ]
    }
  },
  administration_rules: (form = {}, meta = {}) => {
    const { sourceType = null } = meta
    return {
      label: 'Administration Rules',
      cols: [
        {
          namespace: 'administration_rules',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Rule'),
            sortable: true,
            field: {
              component: pfFieldRule,
              attrs: {
                default: {
                  id: null,
                  description: null,
                  match: 'all',
                  actions: [ { type: 'set_access_level', value: null } ],
                  conditions: []
                },
                matchLabel: i18n.t('Select rule match'),
                actions: {
                  component: pfFieldTypeValue,
                  attrs: {
                    typeLabel: i18n.t('Select action type'),
                    valueLabel: i18n.t('Select action value'),
                    fields: [
                      ...[
                        pfActions.set_access_level,
                        pfActions.mark_as_sponsor,
                        pfActions.set_tenant_id
                      ],
                      ...((['AD', 'LDAP'].includes(sourceType))
                        ? [pfActions.set_access_durations]
                        : []
                      )
                    ]
                  }
                },
                conditions: {
                  component: pfFieldAttributeOperatorValue,
                  attrs: {
                    attributeLabel: i18n.t('Select attribute'),
                    operatorLabel: i18n.t('Select operator'),
                    valueLabel: i18n.t('Select value'),
                    fields: pfConfigurationAuthenticationSourceRulesConditionFieldsFromMeta(meta, 'administration_rules.conditions.attribute')
                  }
                },
                invalidFeedback: i18n.t('Administration rule contains one or more errors.')
              }
            }
          }
        }
      ]
    }
  },
  allowed_domains: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Comma-separated list of Allowed Domains'),
      text: i18n.t('A comma-separated list of domains that are allowed for email registration. Wildcards are accepted (*pfdemo.org). Allowed domains are checked after banned domains.'),
      cols: [
        {
          namespace: 'allowed_domains',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'allowed_domains'),
            ...{
              rows: 3
            }
          }
        }
      ]
    }
  },
  allow_localdomain: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Allow Local Domain'),
      text: i18n.t('Accept self-registration with email address from the local domain.'),
      cols: [
        {
          namespace: 'allow_localdomain',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'yes', unchecked: 'no' }
          }
        }
      ]
    }
  },
  api_key: (form = {}, meta = {}) => {
    return {
      label: i18n.t('API Key'),
      cols: [
        {
          namespace: 'api_key',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'api_key')
        }
      ]
    }
  },
  api_login_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('API login ID'),
      cols: [
        {
          namespace: 'api_login_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'api_login_id')
        }
      ]
    }
  },
  api_username: (form = {}, meta = {}) => {
    return {
      label: i18n.t('API username (basic auth)'),
      cols: [
        {
          namespace: 'username',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'username')
        }
      ]
    }
  },
  api_password: (form = {}, meta = {}) => {
    return {
      label: i18n.t('API password (basic auth)'),
      cols: [
        {
          namespace: 'password',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'password')
        }
      ]
    }
  },
  auth_listening_port: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authentication listening port'),
      text: i18n.t('PacketFence Eduroam RADIUS virtual server authentication listening port.'),
      cols: [
        {
          namespace: 'auth_listening_port',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'auth_listening_port')
        }
      ]
    }
  },
  auth_token: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Auth Token'),
      text: i18n.t('Twilio Auth Token.'),
      cols: [
        {
          namespace: 'auth_token',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'auth_token')
        }
      ]
    }
  },
  authenticate_realm: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Realm to use to authenticate'),
      cols: [
        {
          namespace: 'authenticate_realm',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'authenticate_realm')
        }
      ]
    }
  },
  authentication_rules: (form = {}, meta = {}) => {
    return {
      label: 'Authentication Rules',
      cols: [
        {
          namespace: 'authentication_rules',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Rule'),
            sortable: true,
            field: {
              component: pfFieldRule,
              attrs: {
                default: {
                  id: null,
                  description: null,
                  match: 'all',
                  actions: [ { type: 'set_role', value: 'default' } ],
                  conditions: []
                },
                matchLabel: i18n.t('Select rule match'),
                actions: {
                  component: pfFieldTypeValue,
                  attrs: {
                    typeLabel: i18n.t('Select action type'),
                    valueLabel: i18n.t('Select action value'),
                    fields: [
                      pfActions.set_role_by_name,
                      pfActions.set_access_duration,
                      pfActions.set_unreg_date,
                      pfActions.set_time_balance,
                      pfActions.set_bandwidth_balance
                    ]
                  }
                },
                conditions: {
                  component: pfFieldAttributeOperatorValue,
                  attrs: {
                    attributeLabel: i18n.t('Select attribute'),
                    operatorLabel: i18n.t('Select operator'),
                    valueLabel: i18n.t('Select value'),
                    fields: pfConfigurationAuthenticationSourceRulesConditionFieldsFromMeta(meta, 'authentication_rules.conditions.attribute')
                  }
                },
                invalidFeedback: i18n.t('Authentication rule contains one or more errors.')
              }
            }
          }
        }
      ]
    }
  },
  authentication_url: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authentication URL'),
      text: i18n.t('Note : The URL is always prefixed by a slash (/).'),
      cols: [
        {
          namespace: 'authentication_url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'authentication_url')
        }
      ]
    }
  },
  authorization_source_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authorization source'),
      text: i18n.t('The source to use for authorization (rule matching).'),
      cols: [
        {
          namespace: 'authorization_source_id',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'authorization_source_id')
        }
      ]
    }
  },
  authorize_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('API Authorize Path'),
      cols: [
        {
          namespace: 'authorize_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'authorize_path')
        }
      ]
    }
  },
  authorization_url: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authorization URL'),
      text: i18n.t('Note : The URL is always prefixed by a slash (/).'),
      cols: [
        {
          namespace: 'authorization_url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'authorization_url')
        }
      ]
    }
  },
  banned_domains: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Comma-separated list of Banned Domains'),
      text: i18n.t('A comma-separated list of domains that are banned for email registration. Wildcards are accepted (*pfdemo.org). Banned domains are checked before allowed domains.'),
      cols: [
        {
          namespace: 'banned_domains',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'banned_domains'),
            ...{
              rows: 3
            }
          }
        }
      ]
    }
  },
  base_url: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Iframe Base URL'),
      cols: [
        {
          namespace: 'base_url',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'base_url')
        }
      ]
    }
  },
  basedn: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Base DN'),
      cols: [
        {
          namespace: 'basedn',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'basedn')
        }
      ]
    }
  },
  binddn: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Bind DN'),
      text: i18n.t('Leave this field empty if you want to perform an anonymous bind.'),
      cols: [
        {
          namespace: 'binddn',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'binddn')
        }
      ]
    }
  },
  cache_match: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Cache match'),
      text: i18n.t('Will cache results of matching a rule.'),
      cols: [
        {
          namespace: 'cache_match',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: '1', unchecked: '0' }
          }
        }
      ]
    }
  },
  cert_file: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Cert file'),
      text: i18n.t('The path to the certificate you submitted to Paypal.'),
      cols: [
        {
          namespace: 'cert_file',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cert_file')
        }
      ]
    }
  },
  cert_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Cert ID'),
      cols: [
        {
          namespace: 'cert_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'cert_id')
        }
      ]
    }
  },
  client_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('App ID'),
      cols: [
        {
          namespace: 'client_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'client_id')
        }
      ]
    }
  },
  client_secret: (form = {}, meta = {}) => {
    return {
      label: i18n.t('App Secret'),
      cols: [
        {
          namespace: 'client_secret',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'client_secret')
        }
      ]
    }
  },
  connection_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Connection timeout'),
      text: i18n.t('LDAP connection Timeout.'),
      cols: [
        {
          namespace: 'connection_timeout',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'connection_timeout')
        }
      ]
    }
  },
  create_local_account: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Create Local Account'),
      text: i18n.t('Create a local account on the PacketFence system based on the username provided.'),
      cols: [
        {
          namespace: 'create_local_account',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'yes', unchecked: 'no' }
          }
        }
      ]
    }
  },
  currency: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Currency'),
      cols: [
        {
          namespace: 'currency',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'currency')
        }
      ]
    }
  },
  description: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Description'),
      cols: [
        {
          namespace: 'description',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'description')
        }
      ]
    }
  },
  direct_base_url: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Direct Base url'),
      cols: [
        {
          namespace: 'direct_base_url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'direct_base_url')
        }
      ]
    }
  },
  domains: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authorized domains'),
      text: i18n.t('Comma-separated list of domains that will be resolve with the correct IP addresses.'),
      cols: [
        {
          namespace: 'domains',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'domains')
        }
      ]
    }
  },
  email_activation_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Email Activation Timeout'),
      text: null, // multiple occurances w/ different strings, nullify for overload
      cols: [
        {
          namespace: 'email_activation_timeout.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'email_activation_timeout.interval')
        },
        {
          namespace: 'email_activation_timeout.unit',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'email_activation_timeout.unit'),
            ...{
              allowEmpty: false
            }
          }
        }
      ]
    }
  },
  email_address: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Email address'),
      text: i18n.t('The email address associated to your paypal account.'),
      cols: [
        {
          namespace: 'email_address',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'email_address')
        }
      ]
    }
  },
  email_attribute: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Email Attribute'),
      text: i18n.t('LDAP attribute name that stores the email address against which the filter will match.'),
      cols: [
        {
          namespace: 'email_attribute',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'email_attribute')
        }
      ]
    }
  },
  email_required: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Email required'),
      cols: [
        {
          namespace: 'email_required',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'yes', unchecked: 'no' }
          }
        }
      ]
    }
  },
  group_header: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Group header '),
      cols: [
        {
          namespace: 'group_header',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'group_header')
        }
      ]
    }
  },
  hash_passwords: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Database passwords hashing method'),
      text: i18n.t('The algorithm used to hash the passwords in the database.This will only affect newly created or reset passwords.'),
      cols: [
        {
          namespace: 'hash_passwords',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'hash_passwords')
        }
      ]
    }
  },
  host: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Host'),
      cols: [
        {
          namespace: 'host',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'host')
        }
      ]
    }
  },
  host_port_encryption: (form = {}, meta = {}) => {
    const portHelper = (form = {}, meta = {}) => {
      const { encryption, port } = form
      let helper = null
      switch (encryption) {
        case 'none':
        case 'starttls':
          if (~~port !== 389) {
            helper = i18n.t('Port {port} is standard for {encryption} encryption.', { encryption: encryption.toUpperCase(), port: 389 })
          }
          break
        case 'ssl':
          if (~~port !== 636) {
            helper = i18n.t('Port {port} is standard for {encryption} encryption.', { encryption: encryption.toUpperCase(), port: 636 })
          }
          break
      }
      return helper
    }

    return {
      label: i18n.t('Host'),
      cols: [
        {
          namespace: 'host',
          component: pfFormInputMultiple,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'host'),
            ...{
              class: 'col-sm-4',
              placeholder: i18n.t('Enter a new host'),
              tagPlaceholder: i18n.t('Click to add host')
            }
          }
        },
        {
          text: ':',
          class: 'ml-1 font-weight-bold'
        },
        {
          namespace: 'port',
          component: pfFormInput,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'port'),
            ...{
              class: 'mx-1 col-sm-2'
            }
          }
        },
        {
          namespace: 'encryption',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'encryption'),
            ...{
              class: 'col-sm-2'
            }
          }
        },
        {
          if: portHelper(form, meta) !== null,
          component: pfFormHtml,
          attrs: {
            html: `<div class="alert alert-warning px-3 py-2 mx-1 my-0">
              <strong>${i18n.t('Note')}:</strong> ${portHelper(form, meta)}
            </div>`
          }
        }
      ]
    }
  },
  identity_token: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Identity token'),
      cols: [
        {
          namespace: 'identity_token',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'identity_token')
        }
      ]
    }
  },
  idp_ca_cert_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Path to Identity Provider CA cert (x509)'),
      text: i18n.t('If your Identity Provider uses a self-signed certificate, put the path to its certificate here instead.'),
      cols: [
        {
          namespace: 'idp_ca_cert_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'idp_ca_cert_path')
        }
      ]
    }
  },
  idp_cert_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Path to Identity Provider cert (x509)'),
      cols: [
        {
          namespace: 'idp_cert_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'idp_cert_path')
        }
      ]
    }
  },
  idp_entity_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Identity Provider entity ID'),
      cols: [
        {
          namespace: 'idp_entity_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'idp_entity_id')
        }
      ]
    }
  },
  idp_metadata_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Path to Identity Provider metadata'),
      cols: [
        {
          namespace: 'idp_metadata_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'idp_metadata_path')
        }
      ]
    }
  },
  key_file: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Key file'),
      text: i18n.t('The path to the associated key of the certificate you submitted to Paypal.'),
      cols: [
        {
          namespace: 'key_file',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'key_file')
        }
      ]
    }
  },
  lang: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Language'),
      text: i18n.t('Language for sponsor email.'),
      cols: [
        {
          namespace: 'lang',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'lang')
        }
      ]
    }
  },
  local_account_logins: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Amount of logins for the local account'),
      text: i18n.t('The amount of times, the local account can be used after its created. 0 means infinite.'),
      cols: [
        {
          namespace: 'local_account_logins',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'local_account_logins')
        }
      ]
    }
  },
  local_realm: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Local Realms'),
      text: i18n.t('Realms that will be authenticate locally.'),
      cols: [
        {
          namespace: 'local_realm',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'local_realm')
        }
      ]
    }
  },
  merchant_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Merchant ID'),
      cols: [
        {
          namespace: 'merchant_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'merchant_id')
        }
      ]
    }
  },
  message: (form = {}, meta = {}) => {
    return {
      label: i18n.t('SMS text message ($pin will be replaced by the PIN number)'),
      cols: [
        {
          namespace: 'message',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'message'),
            ...{
              rows: 5
            }
          }
        }
      ]
    }
  },
  monitor: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Monitor'),
      text: i18n.t('Do you want to monitor this source?'),
      cols: [
        {
          namespace: 'monitor',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: '1', unchecked: '0' }
          }
        }
      ]
    }
  },
  options: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Options'),
      text: i18n.t('Define options for FreeRADIUS home_server definition (if you use the source in the realm configuration). Need a radiusd restart.'),
      cols: [
        {
          namespace: 'options',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'options'),
            ...{
              rows: 3
            }
          }
        }
      ]
    }
  },
  password: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Password'),
      cols: [
        {
          namespace: 'password',
          component: pfFormPassword,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'password'),
            ...{
              test: () => {
                return store.dispatch('$_sources/testAuthenticationSource', form).then(response => {
                  return response
                }).catch(err => {
                  throw err
                })
              }
            }
          }
        }
      ]
    }
  },
  password_email_update: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Email'),
      text: i18n.t('Email addresses to send the new generated password.'),
      cols: [
        {
          namespace: 'password_email_update',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'password_email_update')
        }
      ]
    }
  },
  password_length: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Password length '),
      text: i18n.t('The length of the password to generate.'),
      cols: [
        {
          namespace: 'password_length',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'password_length')
        }
      ]
    }
  },
  password_rotation: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Password rotation duration'),
      text: i18n.t('Period of time after the password must be rotated.'),
      cols: [
        {
          namespace: 'password_rotation',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'password_rotation')
        }
      ]
    }
  },
  path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('File Path'),
      cols: [
        {
          namespace: 'path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'path')
        }
      ]
    }
  },
  payment_type: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Payment type'),
      cols: [
        {
          namespace: 'payment_type',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'payment_type')
        }
      ]
    }
  },
  paypal_cert_file: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Paypal cert file'),
      text: i18n.t('The path to the Paypal certificate you downloaded.'),
      cols: [
        {
          namespace: 'paypal_cert_file',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'paypal_cert_file')
        }
      ]
    }
  },
  pin_code_length: (form = {}, meta = {}) => {
    return {
      label: i18n.t('PIN length'),
      text: i18n.t('The amount of digits of the PIN number.'),
      cols: [
        {
          namespace: 'pin_code_length',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'pin_code_length')
        }
      ]
    }
  },
  port: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Port'),
      text: i18n.t('If you use this source in the realm configuration the accounting port will be this port + 1.'),
      cols: [
        {
          namespace: 'port',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'port')
        }
      ]
    }
  },
  protected_resource_url: (form = {}, meta = {}) => {
    return {
      label: null, // multiple occurances w/ different strings, nullify for overload
      cols: [
        {
          namespace: 'protected_resource_url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'protected_resource_url')
        }
      ]
    }
  },
  protocol_host_port: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Host'),
      cols: [
        {
          namespace: 'protocol',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'protocol'),
            ...{
              class: 'col-sm-2'
            }
          }
        },
        {
          namespace: 'host',
          component: pfFormInput,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'host'),
            ...{
              class: 'mx-1 col-sm-4'
            }
          }
        },
        {
          text: ':',
          class: 'font-weight-bold'
        },
        {
          namespace: 'port',
          component: pfFormInput,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'port'),
            ...{
              class: 'mx-1 col-sm-2'
            }
          }
        }
      ]
    }
  },
  proxy_addresses: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Proxy addresses'),
      text: i18n.t('A comma seperated list of IP Address.'),
      cols: [
        {
          namespace: 'proxy_addresses',
          component: pfFormTextarea,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'proxy_addresses'),
            ...{
              rows: 5
            }
          }
        }
      ]
    }
  },
  public_client_key: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Public Client Key'),
      cols: [
        {
          namespace: 'public_client_key',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'public_client_key')
        }
      ]
    }
  },
  publishable_key: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Publishable key'),
      cols: [
        {
          namespace: 'publishable_key',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'publishable_key')
        }
      ]
    }
  },
  radius_secret: (form = {}, meta = {}) => {
    return {
      label: i18n.t('RADIUS secret'),
      text: i18n.t('Eduroam RADIUS secret.'),
      cols: [
        {
          namespace: 'radius_secret',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'radius_secret')
        }
      ]
    }
  },
  read_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Response timeout'),
      text: i18n.t('LDAP response timeout.'),
      cols: [
        {
          namespace: 'read_timeout',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'read_timeout')
        }
      ]
    }
  },
  realms: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Associated Realms'),
      text: i18n.t('Realms that will be associated with this source.'),
      cols: [
        {
          namespace: 'realms',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'realms')
        }
      ]
    }
  },
  redirect_url: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Portal URL'),
      text: i18n.t('The hostname must be the one of your captive portal.'),
      cols: [
        {
          namespace: 'redirect_url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'redirect_url')
        }
      ]
    }
  },
  reject_realm: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Reject Realms'),
      text: i18n.t('Realms that will be rejected.'),
      cols: [
        {
          namespace: 'reject_realm',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'reject_realm')
        }
      ]
    }
  },
  scope: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Scope'),
      cols: [
        {
          namespace: 'scope',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'scope')
        }
      ]
    }
  },
  searchattributes: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Search Attributes'),
      text: i18n.t('Other attributes that can be used as the username (requires to restart the radiusd service to be effective).'),
      cols: [
        {
          namespace: 'searchattributes',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'searchattributes')
        }
      ]
    }
  },
  secret: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Secret'),
      cols: [
        {
          namespace: 'secret',
          component: pfFormPassword,
          attrs: pfConfigurationAttributesFromMeta(meta, 'secret')
        }
      ]
    }
  },
  secret_key: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Secret key'),
      cols: [
        {
          namespace: 'secret_key',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'secret_key')
        }
      ]
    }
  },
  send_email_confirmation: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Send billing confirmation'),
      cols: [
        {
          namespace: 'send_email_confirmation',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'enabled', unchecked: 'disabled' }
          }
        }
      ]
    }
  },
  server1_address: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Server 1 address'),
      text: i18n.t('Eduroam server 1 address.'),
      cols: [
        {
          namespace: 'server1_address',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'server1_address')
        }
      ]
    }
  },
  server1_port: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Eduroam server 1 port'),
      cols: [
        {
          namespace: 'server1_port',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'server1_port')
        }
      ]
    }
  },
  server2_address: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Server 2 address'),
      text: i18n.t('Eduroam server 1 address.'),
      cols: [
        {
          namespace: 'server2_address',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'server2_address')
        }
      ]
    }
  },
  server2_port: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Eduroam server 2 port'),
      cols: [
        {
          namespace: 'server2_port',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'server2_port')
        }
      ]
    }
  },
  service_fqdn: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Service FQDN'),
      cols: [
        {
          namespace: 'service_fqdn',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'service_fqdn')
        }
      ]
    }
  },
  shared_secret: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Shared Secret'),
      text: i18n.t('MKEY for the iframe.'),
      cols: [
        {
          namespace: 'shared_secret',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'shared_secret')
        }
      ]
    }
  },
  shared_secret_direct: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Shared Secret Direct'),
      text: i18n.t('MKEY for Mirapay Direct.'),
      cols: [
        {
          namespace: 'shared_secret_direct',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'shared_secret_direct')
        }
      ]
    }
  },
  shuffle: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Shuffle'),
      text: i18n.t('Randomly choose LDAP server to query.'),
      cols: [
        {
          namespace: 'shuffle',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: '1', unchecked: '0' }
          }
        }
      ]
    }
  },
  site: (form = {}, meta = {}) => {
    return {
      label: null, // multiple occurances w/ different strings, nullify for overload
      cols: [
        {
          namespace: 'site',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'site')
        }
      ]
    }
  },
  sms_activation_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('SMS Activation Timeout '),
      text: i18n.t('This is the delay given to a guest who registered by SMS confirmation to fill the PIN code.'),
      cols: [
        {
          namespace: 'sms_activation_timeout.interval',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sms_activation_timeout.interval')
        },
        {
          namespace: 'sms_activation_timeout.unit',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'sms_activation_timeout.unit'),
            ...{
              allowEmpty: false
            }
          }
        }
      ]
    }
  },
  sms_carriers: (form = {}, meta = {}) => {
    return {
      label: i18n.t('SMS Carriers'),
      text: i18n.t('List of phone carriers available to the user.'),
      cols: [
        {
          namespace: 'sms_carriers',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sms_carriers')
        }
      ]
    }
  },
  sources: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Associated Sources'),
      text: i18n.t('Sources that will be associated with this source (For the Sponsor)'),
      cols: [
        {
          namespace: 'sources',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sources')
        }
      ]
    }
  },
  sp_cert_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Path to Service Provider cert (x509)'),
      cols: [
        {
          namespace: 'sp_cert_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sp_cert_path')
        }
      ]
    }
  },
  sp_entity_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Service Provider entity ID'),
      cols: [
        {
          namespace: 'sp_entity_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sp_entity_id')
        }
      ]
    }
  },
  sp_key_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Path to Service Provider key (x509)'),
      cols: [
        {
          namespace: 'sp_key_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sp_key_path')
        }
      ]
    }
  },
  sponsorship_bcc: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sponsorship BCC'),
      text: i18n.t('Sponsors requesting access and access confirmation emails are BCC\'ed to this address. Multiple destinations can be comma-separated.'),
      cols: [
        {
          namespace: 'sponsorship_bcc',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'sponsorship_bcc')
        }
      ]
    }
  },
  style: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Style'),
      cols: [
        {
          namespace: 'style',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'style')
        }
      ]
    }
  },
  terminal_group_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Terminal Group ID'),
      text: i18n.t('Terminal Group ID for Mirapay Direct.'),
      cols: [
        {
          namespace: 'terminal_group_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'terminal_group_id')
        }
      ]
    }
  },
  terminal_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Terminal ID'),
      text: i18n.t('Terminal ID for Mirapay Direct.'),
      cols: [
        {
          namespace: 'terminal_id',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'terminal_id')
        }
      ]
    }
  },
  test_mode: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Test mode'),
      cols: [
        {
          namespace: 'test_mode',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: '1', unchecked: '0' }
          }
        }
      ]
    }
  },
  timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Timeout'),
      cols: [
        {
          namespace: 'timeout',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'timeout')
        }
      ]
    }
  },
  transaction_key: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Transaction key'),
      cols: [
        {
          namespace: 'transaction_key',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'transaction_key')
        }
      ]
    }
  },
  twilio_phone_number: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Phone Number (From)'),
      text: i18n.t('Twilio provided phone number which will show as the sender.'),
      cols: [
        {
          namespace: 'twilio_phone_number',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'twilio_phone_number')
        }
      ]
    }
  },
  user_header: (form = {}, meta = {}) => {
    return {
      label: i18n.t('User header '),
      cols: [
        {
          namespace: 'user_header',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'user_header')
        }
      ]
    }
  },
  username_attribute: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Attribute of the username in the SAML response.'),
      cols: [
        {
          namespace: 'username_attribute',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'username_attribute')
        }
      ]
    }
  },
  usernameattribute: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Username Attribute'),
      text: i18n.t('Main reference attribute that contain the username.'),
      cols: [
        {
          namespace: 'usernameattribute',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'usernameattribute')
        }
      ]
    }
  },
  validate_sponsor: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sponsor Validation'),
      text: i18n.t('Force sponsor to authenticate when validating a guest request.'),
      cols: [
        {
          namespace: 'validate_sponsor',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 'yes', unchecked: 'no' }
          }
        }
      ]
    }
  },
  write_timeout: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Request timeout'),
      text: i18n.t('LDAP request timeout.'),
      cols: [
        {
          namespace: 'write_timeout',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'write_timeout')
        }
      ]
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const { sourceType = null } = meta
  switch (sourceType) {
    case 'AD':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.host_port_encryption(form, meta),
            viewFields.connection_timeout(form, meta),
            viewFields.write_timeout(form, meta),
            viewFields.read_timeout(form, meta),
            viewFields.basedn(form, meta),
            viewFields.scope(form, meta),
            viewFields.usernameattribute(form, meta),
            viewFields.searchattributes(form, meta),
            viewFields.email_attribute(form, meta),
            viewFields.binddn(form, meta),
            viewFields.password(form, meta),
            viewFields.cache_match(form, meta),
            viewFields.monitor(form, meta),
            viewFields.shuffle(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'Authorization':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            { ...viewFields.realms(form, meta), ...{ text: i18n.t('Realms that will be associated with this source (for the portal/admin GUI/RADIUS post-auth, not for FreeRADIUS proxy).') } },
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'EAPTLS':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'Htpasswd':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.path(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'HTTP':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.protocol_host_port(form, meta),
            viewFields.api_username(form, meta),
            viewFields.api_password(form, meta),
            viewFields.authentication_url(form, meta),
            viewFields.authorization_url(form, meta),
            viewFields.realms(form, meta)
          ]
        }
      ]
    case 'Kerberos':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.host(form, meta),
            viewFields.authenticate_realm(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'LDAP':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.host_port_encryption(form, meta),
            viewFields.connection_timeout(form, meta),
            viewFields.write_timeout(form, meta),
            viewFields.read_timeout(form, meta),
            viewFields.basedn(form, meta),
            viewFields.scope(form, meta),
            viewFields.usernameattribute(form, meta),
            viewFields.searchattributes(form, meta),
            viewFields.email_attribute(form, meta),
            viewFields.binddn(form, meta),
            viewFields.password(form, meta),
            viewFields.cache_match(form, meta),
            viewFields.monitor(form, meta),
            viewFields.shuffle(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'Potd':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.password_rotation(form, meta),
            viewFields.password_email_update(form, meta),
            viewFields.password_length(form, meta),
            { ...viewFields.realms(form, meta), ...{ text: i18n.t('Realms that will be associated with this source (for the portal/admin GUI/RADIUS post-auth, not for FreeRADIUS proxy).') } },
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'RADIUS':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.host(form, meta),
            viewFields.port(form, meta),
            viewFields.secret(form, meta),
            viewFields.timeout(form, meta),
            viewFields.monitor(form, meta),
            viewFields.options(form, meta),
            viewFields.realms(form, meta),
            viewFields.authentication_rules(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'SAML':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.sp_entity_id(form, meta),
            viewFields.sp_key_path(form, meta),
            viewFields.sp_cert_path(form, meta),
            viewFields.idp_entity_id(form, meta),
            viewFields.idp_metadata_path(form, meta),
            viewFields.idp_cert_path(form, meta),
            viewFields.idp_ca_cert_path(form, meta),
            viewFields.username_attribute(form, meta),
            viewFields.authorization_source_id(form, meta)
          ]
        }
      ]
    case 'Clickatell':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            { ...viewFields.api_key(form, meta), ...{ text: i18n.t('Clickatell API Key.') } },
            viewFields.message(form, meta),
            viewFields.pin_code_length(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Email':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.banned_domains(form, meta),
            viewFields.allowed_domains(form, meta),
            {
              ...viewFields.email_activation_timeout(form, meta),
              ...{ text: i18n.t('This is the delay given to a guest who registered by email confirmation to log into his email and click the activation link.') }
            }, // re-text
            viewFields.allow_localdomain(form, meta),
            viewFields.activation_domain(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Facebook':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('Graph API URL') } }, // re-label
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('Graph API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('Graph API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Github':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Google':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Instagram':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('Graph API URL') } }, // re-label
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('Graph API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('Graph API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Kickbox':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            { ...viewFields.api_key(form, meta), ...{ text: i18n.t('Kickbox.io API key.') } },
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'LinkedIn':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Null':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.email_required(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'OpenID':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Pinterest':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('Graph API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('Graph API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'SMS':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.sms_carriers(form, meta),
            viewFields.sms_activation_timeout(form, meta),
            viewFields.message(form, meta),
            viewFields.pin_code_length(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'SponsorEmail':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.sources(form, meta),
            viewFields.allow_localdomain(form, meta),
            viewFields.banned_domains(form, meta),
            viewFields.allowed_domains(form, meta),
            { ...viewFields.email_activation_timeout(form, meta), ...{ text: i18n.t('Delay given to a sponsor to click the activation link.') } }, // re-text
            viewFields.activation_domain(form, meta),
            viewFields.sponsorship_bcc(form, meta),
            viewFields.validate_sponsor(form, meta),
            viewFields.lang(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Twilio':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.account_sid(form, meta),
            viewFields.auth_token(form, meta),
            viewFields.twilio_phone_number(form, meta),
            viewFields.message(form, meta),
            viewFields.pin_code_length(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'Twitter':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'WindowsLive':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.client_id(form, meta),
            viewFields.client_secret(form, meta),
            { ...viewFields.site(form, meta), ...{ label: i18n.t('API URL') } }, // re-label
            viewFields.authorize_path(form, meta),
            { ...viewFields.access_token_path(form, meta), ...{ label: i18n.t('API Token Path') } }, // re-label
            viewFields.access_token_param(form, meta),
            viewFields.access_scope(form, meta),
            { ...viewFields.protected_resource_url(form, meta), ...{ label: i18n.t('API URL of logged user') } }, // re-label
            viewFields.redirect_url(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'AdminProxy':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.proxy_addresses(form, meta),
            viewFields.user_header(form, meta),
            viewFields.group_header(form, meta),
            viewFields.administration_rules(form, meta)
          ]
        }
      ]
    case 'Blackhole':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta)
          ]
        }
      ]
    case 'Eduroam':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.server1_address(form, meta),
            viewFields.server1_port(form, meta),
            viewFields.server2_address(form, meta),
            viewFields.server2_port(form, meta),
            viewFields.radius_secret(form, meta),
            viewFields.auth_listening_port(form, meta),
            viewFields.reject_realm(form, meta),
            viewFields.local_realm(form, meta),
            viewFields.monitor(form, meta),
            viewFields.authentication_rules(form, meta)
          ]
        }
      ]
    case 'AuthorizeNet':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.api_login_id(form, meta),
            viewFields.transaction_key(form, meta),
            viewFields.public_client_key(form, meta),
            viewFields.domains(form, meta),
            viewFields.currency(form, meta),
            viewFields.test_mode(form, meta),
            viewFields.send_email_confirmation(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta)
          ]
        }
      ]
    case 'Mirapay':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            { label: i18n.t('MiraPay iframe settings'), labelSize: 'lg' },
            viewFields.base_url(form, meta),
            viewFields.merchant_id(form, meta),
            viewFields.shared_secret(form, meta),
            { label: i18n.t('MiraPay direct settings'), labelSize: 'lg' },
            viewFields.direct_base_url(form, meta),
            viewFields.terminal_id(form, meta),
            viewFields.shared_secret_direct(form, meta),
            viewFields.terminal_group_id(form, meta),
            { label: i18n.t('Additional settings'), labelSize: 'lg' },
            viewFields.service_fqdn(form, meta),
            viewFields.currency(form, meta),
            viewFields.test_mode(form, meta),
            viewFields.send_email_confirmation(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta)
          ]
        }
      ]
    case 'Paypal':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.currency(form, meta),
            viewFields.send_email_confirmation(form, meta),
            viewFields.test_mode(form, meta),
            viewFields.identity_token(form, meta),
            viewFields.cert_id(form, meta),
            viewFields.cert_file(form, meta),
            viewFields.key_file(form, meta),
            viewFields.paypal_cert_file(form, meta),
            viewFields.email_address(form, meta),
            viewFields.payment_type(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta)
          ]
        }
      ]
    case 'Stripe':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.currency(form, meta),
            viewFields.send_email_confirmation(form, meta),
            viewFields.test_mode(form, meta),
            viewFields.secret_key(form, meta),
            viewFields.publishable_key(form, meta),
            viewFields.style(form, meta),
            viewFields.domains(form, meta),
            viewFields.create_local_account(form, meta),
            viewFields.hash_passwords(form, meta),
            viewFields.password_length(form, meta),
            viewFields.local_account_logins(form, meta)
          ]
        }
      ]
    default:
      return [
        {
          tab: null, // ignore tabs
          rows: []
        }
      ]
  }
}

export const validatorFields = {
  id: (form = {}, meta = {}) => {
    const { isNew, isClone } = meta
    return {
      id: {
        ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
        ...{
          [i18n.t('Source exists.')]: not(and(required, conditional(isNew || isClone), hasSources, sourceExists))
        }
      }
    }
  },
  access_scope: (form = {}, meta = {}) => {
    return { scope: pfConfigurationValidatorsFromMeta(meta, 'scope', i18n.t('Scope')) }
  },
  access_token_param: (form = {}, meta = {}) => {
    return { access_token_param: pfConfigurationValidatorsFromMeta(meta, 'access_token_param', i18n.t('Parameter')) }
  },
  access_token_path: (form = {}, meta = {}) => {
    return { access_token_path: pfConfigurationValidatorsFromMeta(meta.access_token_path, 'access_token_path', i18n.t('Path')) }
  },
  account_sid: (form = {}, meta = {}) => {
    return { account_sid: pfConfigurationValidatorsFromMeta(meta, 'account_sid', 'SID') }
  },
  activation_domain: (form = {}, meta = {}) => {
    return { activation_domain: pfConfigurationValidatorsFromMeta(meta, 'activation_domain', i18n.t('Host')) }
  },
  administration_rules: (form = {}, meta = {}) => {
    const {
      administration_rules
    } = form
    return {
      administration_rules: {
        ...(administration_rules || []).map((rule) => {
          const { conditions, actions } = rule || {}
          return {
            id: {
              [i18n.t('Name required.')]: required,
              [i18n.t('Alphanumeric characters only.')]: alphaNum,
              [i18n.t('Maximum 255 characters.')]: maxLength(255),
              /* prevent duplicates */
              [i18n.t('Duplicate name.')]: conditional((id) => administration_rules.filter(rule => rule && rule.id === id).length <= 1)
            },
            description: {
              [i18n.t('Maximum 255 characters.')]: maxLength(255)
            },
            match: {
              [i18n.t('Match required.')]: required
            },
            conditions: {
              ...(conditions || []).map((condition) => {
                return {
                  attribute: {
                    [i18n.t('Attribute required.')]: required
                  },
                  operator: {
                    [i18n.t('Operator required.')]: required
                  },
                  value: {
                    [i18n.t('Value required.')]: required
                  }
                }
              })
            },
            actions: {
              ...{
                [i18n.t('Action required')]: required
              },
              ...(actions || []).map((action) => {
                return {
                  type: {
                    [i18n.t('Action required')]: required,
                    /* prevent duplicates */
                    [i18n.t('Duplicate action.')]: conditional((type) => actions.filter(action => action && action.type === type).length <= 1),
                    /* 'set_access_duration' requires 'set_role' */
                    [i18n.t('Action requires "Set Role".')]: conditional((value) => value !== 'set_access_duration' || actions.filter(action => action && action.type === 'set_role').length > 0),
                    /* 'set_access_duration' restricts 'set_unreg_date' */
                    [i18n.t('Action conflicts with "Unregistration date".')]: conditional((value) => value !== 'set_access_duration' || actions.filter(action => action && action.type === 'set_unreg_date').length === 0),
                    /* `set_access_durations' requires 'mark_as_sponsor' */
                    [i18n.t('Action requires "Mark as sponsor".')]: conditional((value) => value !== 'set_access_durations' || actions.filter(action => action && action.type === 'mark_as_sponsor').length > 0),
                    /* 'set_role' requires either 'set_access_duration' or 'set_unreg_date' */
                    [i18n.t('Action requires either "Access duration" or "Unregistration date".')]: conditional((value) => value !== 'set_role' || actions.filter(action => action && ['set_access_duration', 'set_unreg_date'].includes(action.type)).length > 0),
                    /* 'set_unreg_date' requires 'set_role' */
                    [i18n.t('Action requires "Set Role".')]: conditional((value) => value !== 'set_unreg_date' || actions.filter(action => action && action.type === 'set_role').length > 0),
                    /* 'set_unreg_date' restricts 'set_access_duration' */
                    [i18n.t('Action conflicts with "Access duration".')]: conditional((value) => value !== 'set_unreg_date' || actions.filter(action => action && action.type === 'set_access_duration').length === 0)
                  },
                  value: {
                    [i18n.t('Value required')]: required
                  }
                }
              })
            }
          }
        })
      }
    }
  },
  allowed_domains: (form = {}, meta = {}) => {
    return { allowed_domains: pfConfigurationValidatorsFromMeta(meta, 'allowed_domains', i18n.t('Domains')) }
  },
  api_key: (form = {}, meta = {}) => {
    return { api_key: pfConfigurationValidatorsFromMeta(meta, 'api_key', i18n.t('Key')) }
  },
  api_login_id: (form = {}, meta = {}) => {
    return { api_login_id: pfConfigurationValidatorsFromMeta(meta, 'api_login_id', 'ID') }
  },
  api_username: (form = {}, meta = {}) => {
    return { username: pfConfigurationValidatorsFromMeta(meta, 'username', i18n.t('Username')) }
  },
  api_password: (form = {}, meta = {}) => {
    return { password: pfConfigurationValidatorsFromMeta(meta, 'password', i18n.t('Password')) }
  },
  auth_listening_port: (form = {}, meta = {}) => {
    return { auth_listening_port: pfConfigurationValidatorsFromMeta(meta, 'auth_listening_port', i18n.t('Port')) }
  },
  auth_token: (form = {}, meta = {}) => {
    return { auth_token: pfConfigurationValidatorsFromMeta(meta, 'auth_token', i18n.t('Token')) }
  },
  authenticate_realm: (form = {}, meta = {}) => {
    return { authenticate_realm: pfConfigurationValidatorsFromMeta(meta, 'authenticate_realm', i18n.t('Realm')) }
  },
  authentication_rules: (form = {}, meta = {}) => {
    const {
      authentication_rules
    } = form
    return {
      authentication_rules: {
        ...(authentication_rules || []).map((rule) => {
          const { conditions, actions } = rule || {}
          return {
            id: {
              [i18n.t('Name required.')]: required,
              [i18n.t('Alphanumeric characters only.')]: alphaNum,
              [i18n.t('Maximum 255 characters.')]: maxLength(255),
              /* prevent duplicates */
              [i18n.t('Duplicate name.')]: conditional((id) => authentication_rules.filter(rule => rule && rule.id === id).length <= 1)
            },
            description: {
              [i18n.t('Maximum 255 characters.')]: maxLength(255)
            },
            match: {
              [i18n.t('Match required.')]: required
            },
            conditions: {
              ...(conditions || []).map((condition) => {
                return {
                  attribute: {
                    [i18n.t('Attribute required.')]: required
                  },
                  operator: {
                    [i18n.t('Operator required.')]: required
                  },
                  value: {
                    [i18n.t('Value required.')]: required
                  }
                }
              })
            },
            actions: {
              ...{
                [i18n.t('Action required')]: required
              },
              ...(actions || []).map((action) => {
                return {
                  type: {
                    [i18n.t('Action required')]: required,
                    /* prevent duplicates */
                    [i18n.t('Duplicate action.')]: conditional((type) => actions.filter(action => action && action.type === type).length <= 1),
                    /* 'set_access_duration' requires 'set_role' */
                    [i18n.t('Action requires "Set Role".')]: conditional((value) => value !== 'set_access_duration' || actions.filter(action => action && action.type === 'set_role').length > 0),
                    /* 'set_access_duration' restricts 'set_unreg_date' */
                    [i18n.t('Action conflicts with "Unregistration date".')]: conditional((value) => value !== 'set_access_duration' || actions.filter(action => action && action.type === 'set_unreg_date').length === 0),
                    /* `set_access_durations' requires 'mark_as_sponsor' */
                    [i18n.t('Action requires "Mark as sponsor".')]: conditional((value) => value !== 'set_access_durations' || actions.filter(action => action && action.type === 'mark_as_sponsor').length > 0),
                    /* 'set_role' requires either 'set_access_duration' or 'set_unreg_date' */
                    [i18n.t('Action requires either "Access duration" or "Unregistration date".')]: conditional((value) => value !== 'set_role' || actions.filter(action => action && ['set_access_duration', 'set_unreg_date'].includes(action.type)).length > 0),
                    /* 'set_unreg_date' requires 'set_role' */
                    [i18n.t('Action requires "Set Role".')]: conditional((value) => value !== 'set_unreg_date' || actions.filter(action => action && action.type === 'set_role').length > 0),
                    /* 'set_unreg_date' restricts 'set_access_duration' */
                    [i18n.t('Action conflicts with "Access duration".')]: conditional((value) => value !== 'set_unreg_date' || actions.filter(action => action && action.type === 'set_access_duration').length === 0)
                  },
                  value: {
                    [i18n.t('Value required')]: required
                  }
                }
              })
            }
          }
        })
      }
    }
  },
  authentication_url: (form = {}, meta = {}) => {
    return { authentication_url: pfConfigurationValidatorsFromMeta(meta, 'authentication_url', 'URL') }
  },
  authorization_source_id: (form = {}, meta = {}) => {
    return { authorization_source_id: pfConfigurationValidatorsFromMeta(meta, 'authorization_source_id', i18n.t('Source')) }
  },
  authorize_path: (form = {}, meta = {}) => {
    return { authorize_path: pfConfigurationValidatorsFromMeta(meta, 'authorize_path', i18n.t('Path')) }
  },
  authorization_url: (form = {}, meta = {}) => {
    return { authorization_url: pfConfigurationValidatorsFromMeta(meta, 'authorization_url', 'URL') }
  },
  banned_domains: (form = {}, meta = {}) => {
    return { banned_domains: pfConfigurationValidatorsFromMeta(meta, 'banned_domains', i18n.t('Domains')) }
  },
  base_url: (form = {}, meta = {}) => {
    return { base_url: pfConfigurationValidatorsFromMeta(meta, 'base_url', 'URL') }
  },
  basedn: (form = {}, meta = {}) => {
    return { basedn: pfConfigurationValidatorsFromMeta(meta, 'basedn', i18n.t('Base DN')) }
  },
  binddn: (form = {}, meta = {}) => {
    return { bindnd: pfConfigurationValidatorsFromMeta(meta, 'bindnd', i18n.t('Bind DN')) }
  },
  cert_file: (form = {}, meta = {}) => {
    return { cert_file: pfConfigurationValidatorsFromMeta(meta, 'cert_file', i18n.t('File')) }
  },
  cert_id: (form = {}, meta = {}) => {
    return { cert_id: pfConfigurationValidatorsFromMeta(meta, 'cert_id', 'ID') }
  },
  client_id: (form = {}, meta = {}) => {
    return { client_id: pfConfigurationValidatorsFromMeta(meta, 'client_id', 'ID') }
  },
  client_secret: (form = {}, meta = {}) => {
    return { client_secret: pfConfigurationValidatorsFromMeta(meta, 'client_secret', i18n.t('Secret')) }
  },
  connection_timeout: (form = {}, meta = {}) => {
    return { connection_timeout: pfConfigurationValidatorsFromMeta(meta, 'connection_timeout', i18n.t('Timeout')) }
  },
  currency: (form = {}, meta = {}) => {
    return { currency: pfConfigurationValidatorsFromMeta(meta, 'currency', i18n.t('Currency')) }
  },
  description: (form = {}, meta = {}) => {
    return { description: pfConfigurationValidatorsFromMeta(meta, 'description', i18n.t('Description')) }
  },
  direct_base_url: (form = {}, meta = {}) => {
    return { direct_base_url: pfConfigurationValidatorsFromMeta(meta, 'direct_base_url', 'URL') }
  },
  domains: (form = {}, meta = {}) => {
    return { domains: pfConfigurationValidatorsFromMeta(meta, 'domains', i18n.t('Domains')) }
  },
  email_activation_timeout: (form = {}, meta = {}) => {
    return {
      email_activation_timeout: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'email_activation_timeout.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'email_activation_timeout.unit', i18n.t('Unit'))
      }
    }
  },
  email_address: (form = {}, meta = {}) => {
    return { email_address: pfConfigurationValidatorsFromMeta(meta, 'email_address', i18n.t('Email')) }
  },
  email_attribute: (form = {}, meta = {}) => {
    return { email_attribute: pfConfigurationValidatorsFromMeta(meta, 'email_attribute', i18n.t('Attribute')) }
  },
  group_header: (form = {}, meta = {}) => {
    return { group_header: pfConfigurationValidatorsFromMeta(meta, 'group_header', i18n.t('Header')) }
  },
  hash_passwords: (form = {}, meta = {}) => {
    return { hash_passwords: pfConfigurationValidatorsFromMeta(meta, 'hash_passwords', i18n.t('Hash')) }
  },
  host: (form = {}, meta = {}) => {
    return { host: pfConfigurationValidatorsFromMeta(meta, 'host', i18n.t('Host')) }
  },
  host_port_encryption: (form = {}, meta = {}) => {
    return {
      host: pfConfigurationValidatorsFromMeta(meta, 'host', i18n.t('Host')),
      port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port')),
      encryption: pfConfigurationValidatorsFromMeta(meta, 'encryption', i18n.t('Encryption'))
    }
  },
  identity_token: (form = {}, meta = {}) => {
    return { identity_token: pfConfigurationValidatorsFromMeta(meta, 'identity_token', i18n.t('Token')) }
  },
  idp_ca_cert_path: (form = {}, meta = {}) => {
    return { idp_ca_cert_path: pfConfigurationValidatorsFromMeta(meta, 'idp_ca_cert_path', i18n.t('Path')) }
  },
  idp_cert_path: (form = {}, meta = {}) => {
    return { idp_cert_path: pfConfigurationValidatorsFromMeta(meta, 'idp_cert_path', i18n.t('Path')) }
  },
  idp_entity_id: (form = {}, meta = {}) => {
    return { idp_entity_id: pfConfigurationValidatorsFromMeta(meta, 'idp_entity_id', 'ID') }
  },
  idp_metadata_path: (form = {}, meta = {}) => {
    return { idp_metadata_path: pfConfigurationValidatorsFromMeta(meta, 'idp_metadata_path', i18n.t('Path')) }
  },
  key_file: (form = {}, meta = {}) => {
    return { key_file: pfConfigurationValidatorsFromMeta(meta, 'key_file', i18n.t('File')) }
  },
  lang: (form = {}, meta = {}) => {
    return { lang: pfConfigurationValidatorsFromMeta(meta, 'lang', i18n.t('Language')) }
  },
  local_account_logins: (form = {}, meta = {}) => {
    return { local_account_logins: pfConfigurationValidatorsFromMeta(meta, 'local_account_logins', i18n.t('Logins')) }
  },
  local_realm: (form = {}, meta = {}) => {
    return { local_realm: pfConfigurationValidatorsFromMeta(meta, 'local_realm', i18n.t('Realms')) }
  },
  merchant_id: (form = {}, meta = {}) => {
    return { merchant_id: pfConfigurationValidatorsFromMeta(meta, 'merchant_id', 'ID') }
  },
  message: (form = {}, meta = {}) => {
    return { message: pfConfigurationValidatorsFromMeta(meta, 'message', i18n.t('Message')) }
  },
  options: (form = {}, meta = {}) => {
    return { options: pfConfigurationValidatorsFromMeta(meta, 'options', i18n.t('Options')) }
  },
  password: (form = {}, meta = {}) => {
    return { password: pfConfigurationValidatorsFromMeta(meta, 'password', i18n.t('Password')) }
  },
  password_email_update: (form = {}, meta = {}) => {
    return { password_email_update: pfConfigurationValidatorsFromMeta(meta, 'password_email_update', i18n.t('Email')) }
  },
  password_length: (form = {}, meta = {}) => {
    return { password_length: pfConfigurationValidatorsFromMeta(meta, 'password_length', i18n.t('Length')) }
  },
  password_rotation: (form = {}, meta = {}) => {
    return { password_rotation: pfConfigurationValidatorsFromMeta(meta, 'password_rotation', i18n.t('Duration')) }
  },
  path: (form = {}, meta = {}) => {
    return { path: pfConfigurationValidatorsFromMeta(meta, 'path', i18n.t('Path')) }
  },
  payment_type: (form = {}, meta = {}) => {
    return { payment_type: pfConfigurationValidatorsFromMeta(meta, 'payment_type', i18n.t('Type')) }
  },
  paypal_cert_file: (form = {}, meta = {}) => {
    return { paypal_cert_file: pfConfigurationValidatorsFromMeta(meta, 'paypal_cert_file', i18n.t('File')) }
  },
  pin_code_length: (form = {}, meta = {}) => {
    return { pin_code_length: pfConfigurationValidatorsFromMeta(meta, 'pin_code_length', i18n.t('Length')) }
  },
  port: (form = {}, meta = {}) => {
    return { port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port')) }
  },
  protected_resource_url: (form = {}, meta = {}) => {
    return { protected_resource_url: pfConfigurationValidatorsFromMeta(meta, 'protected_resource_url', 'URL') }
  },
  protocol_host_port: (form = {}, meta = {}) => {
    return {
      protocol: pfConfigurationValidatorsFromMeta(meta, 'protocol', i18n.t('Protocol')),
      host: pfConfigurationValidatorsFromMeta(meta, 'host', i18n.t('Host')),
      port: pfConfigurationValidatorsFromMeta(meta, 'port', i18n.t('Port'))
    }
  },
  proxy_addresses: (form = {}, meta = {}) => {
    return { proxy_addresses: pfConfigurationValidatorsFromMeta(meta, 'proxy_addresses', i18n.t('Addresses')) }
  },
  public_client_key: (form = {}, meta = {}) => {
    return { public_client_key: pfConfigurationValidatorsFromMeta(meta, 'public_client_key', i18n.t('Key')) }
  },
  publishable_key: (form = {}, meta = {}) => {
    return { publishable_key: pfConfigurationValidatorsFromMeta(meta, 'publishable_key', i18n.t('Key')) }
  },
  radius_secret: (form = {}, meta = {}) => {
    return { radius_secret: pfConfigurationValidatorsFromMeta(meta, 'radius_secret', i18n.t('Secret')) }
  },
  read_timeout: (form = {}, meta = {}) => {
    return { read_timeout: pfConfigurationValidatorsFromMeta(meta, 'read_timeout', i18n.t('Timeout')) }
  },
  realms: (form = {}, meta = {}) => {
    return { realms: pfConfigurationValidatorsFromMeta(meta, 'realms', i18n.t('Realms')) }
  },
  redirect_url: (form = {}, meta = {}) => {
    return { redirect_url: pfConfigurationValidatorsFromMeta(meta, 'redirect_url', 'URL') }
  },
  reject_realm: (form = {}, meta = {}) => {
    return { reject_realm: pfConfigurationValidatorsFromMeta(meta, 'reject_realm', i18n.t('Realms')) }
  },
  scope: (form = {}, meta = {}) => {
    return { scope: pfConfigurationValidatorsFromMeta(meta, 'scope', i18n.t('Scope')) }
  },
  searchattributes: (form = {}, meta = {}) => {
    return { searchattributes: pfConfigurationValidatorsFromMeta(meta, 'searchattributes', i18n.t('Attribute')) }
  },
  secret: (form = {}, meta = {}) => {
    return { secret: pfConfigurationValidatorsFromMeta(meta, 'secret', i18n.t('Secret')) }
  },
  secret_key: (form = {}, meta = {}) => {
    return { secret_key: pfConfigurationValidatorsFromMeta(meta, 'secret_key', i18n.t('Key')) }
  },
  server1_address: (form = {}, meta = {}) => {
    return { server1_address: pfConfigurationValidatorsFromMeta(meta, 'server1_address', i18n.t('Address')) }
  },
  server1_port: (form = {}, meta = {}) => {
    return { server1_port: pfConfigurationValidatorsFromMeta(meta, 'server1_port', i18n.t('Port')) }
  },
  server2_address: (form = {}, meta = {}) => {
    return { server2_address: pfConfigurationValidatorsFromMeta(meta, 'server2_address', i18n.t('Address')) }
  },
  server2_port: (form = {}, meta = {}) => {
    return { server2_port: pfConfigurationValidatorsFromMeta(meta, 'server2_port', i18n.t('Port')) }
  },
  service_fqdn: (form = {}, meta = {}) => {
    return { service_fqdn: pfConfigurationValidatorsFromMeta(meta, 'service_fqdn', 'FQDN') }
  },
  shared_secret: (form = {}, meta = {}) => {
    return { shared_secret: pfConfigurationValidatorsFromMeta(meta, 'shared_secret', i18n.t('Secret')) }
  },
  shared_secret_direct: (form = {}, meta = {}) => {
    return { shared_secret_direct: pfConfigurationValidatorsFromMeta(meta, 'shared_secret_direct', i18n.t('Secret')) }
  },
  site: (form = {}, meta = {}) => {
    return { site: pfConfigurationValidatorsFromMeta(meta, 'site', 'URL') }
  },
  sms_activation_timeout: (form = {}, meta = {}) => {
    return {
      sms_activation_timeout: {
        interval: pfConfigurationValidatorsFromMeta(meta, 'sms_activation_timeout.interval', i18n.t('Interval')),
        unit: pfConfigurationValidatorsFromMeta(meta, 'sms_activation_timeout.unit', i18n.t('Unit'))
      }
    }
  },
  sms_carriers: (form = {}, meta = {}) => {
    return { sms_carriers: pfConfigurationValidatorsFromMeta(meta, 'sms_carriers', i18n.t('Carriers')) }
  },
  sources: (form = {}, meta = {}) => {
    return { sources: pfConfigurationValidatorsFromMeta(meta, 'sources', i18n.t('Sources')) }
  },
  sp_cert_path: (form = {}, meta = {}) => {
    return { sp_cert_path: pfConfigurationValidatorsFromMeta(meta, 'sp_cert_path', i18n.t('Path')) }
  },
  sp_entity_id: (form = {}, meta = {}) => {
    return { sp_entity_id: pfConfigurationValidatorsFromMeta(meta, 'sp_entity_id', 'ID') }
  },
  sp_key_path: (form = {}, meta = {}) => {
    return { sp_key_path: pfConfigurationValidatorsFromMeta(meta, 'sp_key_path', i18n.t('Path')) }
  },
  sponsorship_bcc: (form = {}, meta = {}) => {
    return { sponsorship_bcc: pfConfigurationValidatorsFromMeta(meta, 'sponsorship_bcc', 'BCC') }
  },
  style: (form = {}, meta = {}) => {
    return { style: pfConfigurationValidatorsFromMeta(meta, 'style', i18n.t('Style')) }
  },
  terminal_group_id: (form = {}, meta = {}) => {
    return { terminal_group_id: pfConfigurationValidatorsFromMeta(meta, 'terminal_group_id', 'ID') }
  },
  terminal_id: (form = {}, meta = {}) => {
    return { terminal_id: pfConfigurationValidatorsFromMeta(meta, 'terminal_id', 'ID') }
  },
  timeout: (form = {}, meta = {}) => {
    return { timeout: pfConfigurationValidatorsFromMeta(meta, 'timeout', i18n.t('Timeout')) }
  },
  transaction_key: (form = {}, meta = {}) => {
    return { transaction_key: pfConfigurationValidatorsFromMeta(meta, 'transaction_key', i18n.t('Key')) }
  },
  twilio_phone_number: (form = {}, meta = {}) => {
    return { twilio_phone_number: pfConfigurationValidatorsFromMeta(meta, 'twilio_phone_number', i18n.t('Phone')) }
  },
  user_header: (form = {}, meta = {}) => {
    return { user_header: pfConfigurationValidatorsFromMeta(meta, 'user_header', i18n.t('Header')) }
  },
  username_attribute: (form = {}, meta = {}) => {
    return { username_attribute: pfConfigurationValidatorsFromMeta(meta, 'username_attribute', i18n.t('Attribute')) }
  },
  usernameattribute: (form = {}, meta = {}) => {
    return { usernameattribute: pfConfigurationValidatorsFromMeta(meta, 'usernameattribute', i18n.t('Attribute')) }
  },
  write_timeout: (form = {}, meta = {}) => {
    return { write_timeout: pfConfigurationValidatorsFromMeta(meta, 'write_timeout', i18n.t('Timeout')) }
  }
}

export const validators = (form = {}, meta = {}) => {
  const { sourceType = null } = meta
  switch (sourceType) {
    case 'AD':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.host_port_encryption(form, meta),
        ...validatorFields.connection_timeout(form, meta),
        ...validatorFields.write_timeout(form, meta),
        ...validatorFields.read_timeout(form, meta),
        ...validatorFields.basedn(form, meta),
        ...validatorFields.scope(form, meta),
        ...validatorFields.usernameattribute(form, meta),
        ...validatorFields.searchattributes(form, meta),
        ...validatorFields.email_attribute(form, meta),
        ...validatorFields.binddn(form, meta),
        ...validatorFields.password(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'Authorization':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'EAPTLS':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'Htpasswd':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.path(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'HTTP':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.protocol_host_port(form, meta),
        ...validatorFields.api_username(form, meta),
        ...validatorFields.api_password(form, meta),
        ...validatorFields.authentication_url(form, meta),
        ...validatorFields.authorization_url(form, meta),
        ...validatorFields.realms(form, meta)
      }
    case 'Kerberos':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.host(form, meta),
        ...validatorFields.authenticate_realm(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'LDAP':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.host_port_encryption(form, meta),
        ...validatorFields.connection_timeout(form, meta),
        ...validatorFields.write_timeout(form, meta),
        ...validatorFields.read_timeout(form, meta),
        ...validatorFields.basedn(form, meta),
        ...validatorFields.scope(form, meta),
        ...validatorFields.usernameattribute(form, meta),
        ...validatorFields.searchattributes(form, meta),
        ...validatorFields.email_attribute(form, meta),
        ...validatorFields.binddn(form, meta),
        ...validatorFields.password(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'Potd':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.password_rotation(form, meta),
        ...validatorFields.password_email_update(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'RADIUS':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.host(form, meta),
        ...validatorFields.port(form, meta),
        ...validatorFields.secret(form, meta),
        ...validatorFields.timeout(form, meta),
        ...validatorFields.options(form, meta),
        ...validatorFields.realms(form, meta),
        ...validatorFields.authentication_rules(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'SAML':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.sp_entity_id(form, meta),
        ...validatorFields.sp_key_path(form, meta),
        ...validatorFields.sp_cert_path(form, meta),
        ...validatorFields.idp_entity_id(form, meta),
        ...validatorFields.idp_metadata_path(form, meta),
        ...validatorFields.idp_cert_path(form, meta),
        ...validatorFields.idp_ca_cert_path(form, meta),
        ...validatorFields.username_attribute(form, meta),
        ...validatorFields.authorization_source_id(form, meta)
      }
    case 'Clickatell':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.api_key(form, meta),
        ...validatorFields.message(form, meta),
        ...validatorFields.pin_code_length(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Email':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.banned_domains(form, meta),
        ...validatorFields.allowed_domains(form, meta),
        ...validatorFields.email_activation_timeout(form, meta),
        ...validatorFields.activation_domain(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Facebook':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Github':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Google':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Instagram':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Kickbox':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.api_key(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'LinkedIn':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Null':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'OpenID':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Pinterest':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'SMS':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.sms_carriers(form, meta),
        ...validatorFields.sms_activation_timeout(form, meta),
        ...validatorFields.message(form, meta),
        ...validatorFields.pin_code_length(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'SponsorEmail':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.sources(form, meta),
        ...validatorFields.banned_domains(form, meta),
        ...validatorFields.allowed_domains(form, meta),
        ...validatorFields.email_activation_timeout(form, meta),
        ...validatorFields.activation_domain(form, meta),
        ...validatorFields.sponsorship_bcc(form, meta),
        ...validatorFields.lang(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Twilio':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.account_sid(form, meta),
        ...validatorFields.auth_token(form, meta),
        ...validatorFields.twilio_phone_number(form, meta),
        ...validatorFields.message(form, meta),
        ...validatorFields.pin_code_length(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'Twitter':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'WindowsLive':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.client_id(form, meta),
        ...validatorFields.client_secret(form, meta),
        ...validatorFields.site(form, meta),
        ...validatorFields.authorize_path(form, meta),
        ...validatorFields.access_token_path(form, meta),
        ...validatorFields.access_token_param(form, meta),
        ...validatorFields.access_scope(form, meta),
        ...validatorFields.protected_resource_url(form, meta),
        ...validatorFields.redirect_url(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'AdminProxy':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.proxy_addresses(form, meta),
        ...validatorFields.user_header(form, meta),
        ...validatorFields.group_header(form, meta),
        ...validatorFields.administration_rules(form, meta)
      }
    case 'Blackhole':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta)
      }
    case 'Eduroam':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.server1_address(form, meta),
        ...validatorFields.server1_port(form, meta),
        ...validatorFields.server2_address(form, meta),
        ...validatorFields.server2_port(form, meta),
        ...validatorFields.radius_secret(form, meta),
        ...validatorFields.auth_listening_port(form, meta),
        ...validatorFields.reject_realm(form, meta),
        ...validatorFields.local_realm(form, meta),
        ...validatorFields.authentication_rules(form, meta)
      }
    case 'AuthorizeNet':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.api_login_id(form, meta),
        ...validatorFields.transaction_key(form, meta),
        ...validatorFields.public_client_key(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.currency(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta)
      }
    case 'Mirapay':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.base_url(form, meta),
        ...validatorFields.merchant_id(form, meta),
        ...validatorFields.shared_secret(form, meta),
        ...validatorFields.direct_base_url(form, meta),
        ...validatorFields.terminal_id(form, meta),
        ...validatorFields.shared_secret_direct(form, meta),
        ...validatorFields.terminal_group_id(form, meta),
        ...validatorFields.service_fqdn(form, meta),
        ...validatorFields.currency(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta)
      }
    case 'Paypal':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.currency(form, meta),
        ...validatorFields.identity_token(form, meta),
        ...validatorFields.cert_id(form, meta),
        ...validatorFields.cert_file(form, meta),
        ...validatorFields.key_file(form, meta),
        ...validatorFields.paypal_cert_file(form, meta),
        ...validatorFields.email_address(form, meta),
        ...validatorFields.payment_type(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta)
      }
    case 'Stripe':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.currency(form, meta),
        ...validatorFields.secret_key(form, meta),
        ...validatorFields.publishable_key(form, meta),
        ...validatorFields.style(form, meta),
        ...validatorFields.domains(form, meta),
        ...validatorFields.hash_passwords(form, meta),
        ...validatorFields.password_length(form, meta),
        ...validatorFields.local_account_logins(form, meta)
      }
    default:
      return {}
  }
}
