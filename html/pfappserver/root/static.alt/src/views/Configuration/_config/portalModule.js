/**
 * See modules under html/pfappserver/lib/pfappserver/Form/Config/PortalModule/
 */
import i18n from '@/utils/locale'
import pfField from '@/components/pfField'
import pfFieldTypeValue from '@/components/pfFieldTypeValue'
import pfFormChosen from '@/components/pfFormChosen'
import pfFormFields from '@/components/pfFormFields'
import pfFormInput from '@/components/pfFormInput'
import pfFormRangeToggle from '@/components/pfFormRangeToggle'
import pfFormTextarea from '@/components/pfFormTextarea'
import { pfActionsFromMeta } from '@/globals/pfActions'
import { pfSearchConditionType as conditionType } from '@/globals/pfSearch'
import {
  pfConfigurationAttributesFromMeta,
  pfConfigurationValidatorsFromMeta
} from '@/globals/configuration/pfConfiguration'
import {
  and,
  not,
  conditional,
  hasPortalModules,
  portalModuleExists
} from '@/globals/pfValidators'
import {
  required
} from 'vuelidate/lib/validators'

const colors = [
  // Colors for types under `Multiple`
  // https://www.colorbox.io/#steps=4#hue_start=223#hue_end=211#hue_curve=linear#sat_start=30#sat_end=30#sat_curve=linear#sat_rate=134#lum_start=48#lum_end=100#lum_curve=linear#lock_hex=
  ['#49577a', '#647ba7', '#7ea1d3', '#98caff'],
  // Colors for types under `Authentication`
  // https://www.colorbox.io/#steps=21#hue_start=359#hue_end=257#hue_curve=linear#sat_start=15#sat_end=85#sat_curve=linear#sat_rate=200#lum_start=100#lum_end=72#lum_curve=linear#lock_hex=
  ['#ffb3b4', '#fbb0b8', '#f8aebb', '#f4abbf', '#f1a9c2', '#eda6c5', '#eaa4c8', '#e69bc9', '#e271c0', '#df30b9', '#db00be', '#d800cd', '#cc00d4', '#b700d1', '#a300cd', '#8f00c9', '#7b00c6', '#6900c2', '#5600bf', '#4500bb', '#3400b8'],
  // Colors for types under `Other`
  // https://www.colorbox.io/#steps=16#hue_start=183#hue_end=70#hue_curve=linear#sat_start=83#sat_end=62#sat_curve=linear#sat_rate=134#lum_start=48#lum_end=100#lum_curve=linear#lock_hex=
  ['#00747a', '#008379', '#008c70', '#009564', '#009e56', '#00a746', '#00af34', '#04b822', '#07c110', '#1bca0b', '#38d310', '#57dc15', '#76e41a', '#97ed1f', '#b9f625', '#dcff2b']
]

export const columns = [
  {
    key: 'id',
    label: i18n.t('Name'),
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
    key: 'modules',
    label: i18n.t('Modules'),
    sortable: true,
    visible: true
  }
]

export const fields = [
  {
    value: 'id',
    text: 'Name',
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'description',
    text: 'Description',
    types: [conditionType.SUBSTRING]
  },
  {
    value: 'type',
    text: 'Type',
    types: [conditionType.SUBSTRING]
  }
]

export const moduleTypes = () => {
  let moduleTypes = [
    {
      name: i18n.t('Multiple'),
      types: [
        { type: 'Choice', name: i18n.t('Choice') },
        { type: 'Chained', name: i18n.t('Chained') }
      ]
    },
    {
      name: i18n.t('Authentication'),
      types: [
        { type: 'Authentication::Billing', name: i18n.t('Billing') },
        { type: 'Authentication::Blackhole', name: i18n.t('Blackhole') },
        { type: 'Authentication::Choice', name: i18n.t('Choice') },
        { type: 'Authentication::Email', name: i18n.t('Email') },
        { type: 'Authentication::Login', name: i18n.t('Login') },
        { type: 'Authentication::Null', name: i18n.t('Null') },
        { type: 'Authentication::Password', name: i18n.t('Password') },
        { type: 'Authentication::OAuth::Facebook', name: 'Facebook' },
        { type: 'Authentication::OAuth::Github', name: 'Github' },
        { type: 'Authentication::OAuth::Google', name: 'Google' },
        { type: 'Authentication::OAuth::Instagram', name: 'Instagram' },
        { type: 'Authentication::OAuth::LinkedIn', name: 'LinkedIn' },
        { type: 'Authentication::OAuth::OpenID', name: 'OpenID' },
        { type: 'Authentication::OAuth::Pinterest', name: 'Pinterest' },
        { type: 'Authentication::OAuth::Twitter', name: 'Twitter' },
        { type: 'Authentication::OAuth::WindowsLive', name: 'WindowsLive' },
        { type: 'Authentication::SAML', name: 'SAML' },
        { type: 'Authentication::SMS', name: i18n.t('SMS') },
        { type: 'Authentication::Sponsor', name: i18n.t('Sponsor') }
      ]
    },
    {
      name: i18n.t('Other'),
      types: [
        { type: 'FixedRole', name: i18n.t('Fixed Role') },
        { type: 'Message', name: i18n.t('Message') },
        { type: 'Provisioning', name: i18n.t('Provisioning') },
        { type: 'SelectRole', name: i18n.t('Select Role') },
        { type: 'SSL_Inspection', name: i18n.t('SSL Inspection') },
        { type: 'Survey', name: i18n.t('Survey') },
        { type: 'URL', name: i18n.t('URL') }
      ]
    }
  ]
  // Assign colors
  moduleTypes.forEach((group, i) => {
    group.types.forEach((item, j) => {
      item.color = colors[i][j]
    })
  })
  return moduleTypes
}

export const moduleTypeName = (moduleType) => {
  let name = moduleType
  moduleTypes().find(group => {
    const module = group.types.find(groupType => groupType.type === moduleType)
    if (module) {
      name = module.name
      return group
    }
  })
  return name
}

export const viewFields = {
  id: (form = {}, meta = {}) => {
    const {
      isNew = false,
      isClone = false
    } = meta
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
  actions: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Actions'),
      cols: [
        {
          namespace: 'actions',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Action'),
            emptyText: i18n.t('If none are specified, the default ones of the module will be used.'),
            sortable: true,
            field: {
              component: pfFieldTypeValue,
              attrs: {
                typeLabel: i18n.t('Select action type'),
                valueLabel: i18n.t('Select action value'),
                fields: pfActionsFromMeta(meta, 'actions.type')
              }
            },
            invalidFeedback: i18n.t('Actions contain one or more errors.')
          }
        }
      ]
    }
  },
  admin_role: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Admin Roles'),
      text: i18n.t('Which roles should have access to this module to select the role'),
      cols: [
        {
          namespace: 'admin_role',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'admin_role'),
            ...{
              multiple: true
            }
          }
        }
      ]
    }
  },
  aup_template: (form = {}, meta = {}) => {
    return {
      label: i18n.t('AUP template'),
      text: i18n.t('The template to use for the Acceptable Use Policy'),
      cols: [
        {
          namespace: 'aup_template',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'aup_template')
        }
      ]
    }
  },
  custom_fields: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Mandatory fields'),
      text: i18n.t('The additionnal fields that should be required for registration'),
      cols: [
        {
          namespace: 'custom_fields',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'custom_fields'),
            ...{
              multiple: true
            }
          }
        }
      ]
    }
  },
  description: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Description'),
      text: i18n.t('The description that will be displayed to users'),
      cols: [
        {
          namespace: 'description',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'description')
        }
      ]
    }
  },
  fields_to_save: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Fields to save'),
      text: i18n.t('These fields will be saved through the registration process'),
      cols: [
        {
          namespace: 'fields_to_save',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'fields_to_save'),
            ...{
              multiple: true
            }
          }
        }
      ]
    }
  },
  forced_sponsor: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Forced Sponsor'),
      text: i18n.t('Defines the sponsor email used. Leave empty so that the user has to specify a sponsor.'),
      cols: [
        {
          namespace: 'forced_sponsor',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'forced_sponsor')
        }
      ]
    }
  },
  landing_template: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Landgin template'),
      text: i18n.t('The template to use for the signup'),
      cols: [
        {
          namespace: 'landing_template',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'landing_template')
        }
      ]
    }
  },
  list_role: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Roles'),
      text: i18n.t('Which roles can be select'),
      cols: [
        {
          namespace: 'list_role',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'list_role'),
            ...{
              multiple: true
            }
          }
        }
      ]
    }
  },
  message: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Message'),
      text: i18n.t('The message that will be displayed to the user. Use with caution as the HTML contained in this field will NOT be escaped.'),
      cols: [
        {
          namespace: 'message',
          component: pfFormTextarea,
          attrs: pfConfigurationAttributesFromMeta(meta, 'message')
        }
      ]
    }
  },
  modules: (form = {}, meta = {}) => {
    const {
      modules
    } = meta
    return {
      label: i18n.t('Modules'),
      cols: [
        {
          namespace: 'modules',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Module'),
            sortable: true,
            field: {
              component: pfField,
              attrs: {
                field: {
                  component: pfFormChosen,
                  attrs: {
                    ...pfConfigurationAttributesFromMeta(modules, 'item'),
                    ...{
                      placeholder: i18n.t('Click to select a module'),
                      groupLabel: 'group',
                      groupValues: 'options'
                    }
                  }
                }
              }
            },
            invalidFeedback: i18n.t('Modules contain one or more errors.')
          }
        }
      ]
    }
  },
  multi_source_ids: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authentication Sources'),
      text: i18n.t('The sources to use in the module. If no sources are specified, all the sources of the connection profile will be used.'),
      cols: [
        {
          namespace: 'multi_source_ids',
          component: pfFormFields,
          attrs: {
            buttonLabel: i18n.t('Add Source'),
            sortable: true,
            field: {
              component: pfField,
              attrs: {
                field: {
                  component: pfFormChosen,
                  attrs: {
                    ...pfConfigurationAttributesFromMeta(meta, 'multi_source_ids'),
                    ...{
                      placeholder: i18n.t('Click to select a source'),
                      multiple: false,
                      closeOnSelect: true
                    }
                  }
                }
              }
            },
            invalidFeedback: i18n.t('Authentication sources contain one or more errors.')
          }
        }
      ]
    }
  },
  multi_source_auth_classes: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sources by Auth Class'),
      text: i18n.t('The sources of these authentication classes and part of the connection profile will be added to the available sources'),
      cols: [
        {
          namespace: 'multi_source_auth_classes',
          component: pfFormTextarea,
          attrs: pfConfigurationAttributesFromMeta(meta, 'multi_source_auth_classes')
        }
      ]
    }
  },
  multi_source_object_classes: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sources by Class'),
      text: i18n.t('The sources inheriting from these classes and part of the connection profile will be added to the available sources'),
      cols: [
        {
          namespace: 'multi_source_object_classes',
          component: pfFormTextarea,
          attrs: pfConfigurationAttributesFromMeta(meta, 'multi_source_object_classes')
        }
      ]
    }
  },
  multi_source_types: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Sources by type'),
      text: i18n.t('The sources of these types and part of the connection profile will be added to the available sources'),
      cols: [
        {
          namespace: 'multi_source_types',
          component: pfFormTextarea,
          attrs: pfConfigurationAttributesFromMeta(meta, 'multi_source_types')
        }
      ]
    }
  },
  pid_field: (form = {}, meta = {}) => {
    return {
      label: i18n.t('PID field'),
      text: i18n.t('Which field should be used as the PID.'),
      cols: [
        {
          namespace: 'pid_field',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'pid_field')
        }
      ]
    }
  },
  show_first_module_on_default: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Show first module when none is selected'),
      cols: [
        {
          namespace: 'show_first_module_on_default',
          component: pfFormRangeToggle,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'show_first_module_on_default'),
            ...{
              values: { checked: 'enabled', unchecked: 'disabled' }
            }
          }
        }
      ]
    }
  },
  signup_template: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Signup template'),
      text: i18n.t('The template to use for the signup'),
      cols: [
        {
          namespace: 'signup_template',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'signup_template')
        }
      ]
    }
  },
  skipable: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Skippable'),
      text: i18n.t('Whether or not, this message can be skipped'),
      cols: [
        {
          namespace: 'skipable',
          component: pfFormRangeToggle,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'skipable'),
            ...{
              values: { checked: 1, unchecked: 0 }
            }
          }
        }
      ]
    }
  },
  source_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Authentication Source'),
      text: i18n.t('The source to use in the module. If no source is specified, all the sources of the connection profile will be used.'),
      cols: [
        {
          namespace: 'source_id',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'source_id'),
            ...{
              placeholder: i18n.t('Click to select a source')
            }
          }
        }
      ]
    }
  },
  ssl_mobileconfig_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('SSL iOS profile URL'),
      text: i18n.t('URL of an iOS mobileconfig profile to install the certificate.'),
      cols: [
        {
          namespace: 'ssl_mobileconfig_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'ssl_mobileconfig_path')
        }
      ]
    }
  },
  ssl_path: (form = {}, meta = {}) => {
    return {
      label: i18n.t('SSL Certificate URL'),
      text: i18n.t('URL of the SSL certificate in X509 Base64 format.'),
      cols: [
        {
          namespace: 'ssl_path',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'ssl_path')
        }
      ]
    }
  },
  stone_roles: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Roles'),
      text: i18n.t('Nodes with the selected roles will be affected'),
      cols: [
        {
          namespace: 'stone_roles',
          component: pfFormChosen,
          attrs: {
            ...pfConfigurationAttributesFromMeta(meta, 'stone_roles'),
            ...{
              multiple: true
            }
          }
        }
      ]
    }
  },
  survey_id: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Survey'),
      text: i18n.t('The survey to use in this portal module. Surveys are defined in survey.conf'),
      cols: [
        {
          namespace: 'survey_id',
          component: pfFormChosen,
          attrs: pfConfigurationAttributesFromMeta(meta, 'survey_id')
        }
      ]
    }
  },
  template: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Template'),
      cols: [
        {
          namespace: 'template',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'template')
        }
      ]
    }
  },
  url: (form = {}, meta = {}) => {
    return {
      label: 'URL',
      text: i18n.t('The URL on which the user should be redirected.'),
      cols: [
        {
          namespace: 'url',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'url')
        }
      ]
    }
  },
  username: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Username'),
      text: i18n.t('Defines the username used for all authentications'),
      cols: [
        {
          namespace: 'username',
          component: pfFormInput,
          attrs: pfConfigurationAttributesFromMeta(meta, 'username')
        }
      ]
    }
  },
  with_aup: (form = {}, meta = {}) => {
    return {
      label: i18n.t('Require AUP'),
      text: i18n.t('Require the user to accept the AUP'),
      cols: [
        {
          namespace: 'with_aup',
          component: pfFormRangeToggle,
          attrs: {
            values: { checked: 1, unchecked: 0 }
          }
        }
      ]
    }
  }
}

export const view = (form = {}, meta = {}) => {
  const {
    moduleType = null
  } = meta
  switch (moduleType) {
    case 'Choice':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.show_first_module_on_default(form, meta),
            viewFields.template(form, meta),
            viewFields.actions(form, meta),
            viewFields.modules(form, meta)
          ]
        }
      ]
    case 'Chained':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.actions(form, meta),
            viewFields.modules(form, meta)
          ]
        }
      ]
    case 'Authentication::Billing':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            // viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.multi_source_ids(form, meta)
          ]
        }
      ]
    case 'Authentication::Blackhole':
      return [
        {
          tab: null,
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.template(form, meta)
          ]
        }
      ]
    case 'Authentication::Choice':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            // viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.template(form, meta),
            viewFields.actions(form, meta),
            viewFields.modules(form, meta),
            viewFields.multi_source_ids(form, meta),
            viewFields.multi_source_object_classes(form, meta),
            viewFields.multi_source_types(form, meta),
            viewFields.multi_source_auth_classes(form, meta)
          ]
        }
      ]
    case 'Authentication::Email':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Authentication::Login':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            // viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.actions(form, meta),
            viewFields.multi_source_ids(form, meta)
          ]
        }
      ]
    case 'Authentication::Null':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    // "Authentication::OAuth"
    case 'Authentication::OAuth::Facebook':
    case 'Authentication::OAuth::Github':
    case 'Authentication::OAuth::Google':
    case 'Authentication::OAuth::Instagram':
    case 'Authentication::OAuth::LinkedIn':
    case 'Authentication::OAuth::OpenID':
    case 'Authentication::OAuth::Pinterest':
    case 'Authentication::OAuth::Twitter':
    case 'Authentication::OAuth::WindowsLive':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.landing_template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Authentication::Password':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            // viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.username(form, meta),
            viewFields.actions(form, meta),
            viewFields.multi_source_ids(form, meta)
          ]
        }
      ]
    case 'Authentication::SAML':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Authentication::SMS':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Authentication::Sponsor':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.pid_field(form, meta),
            viewFields.source_id(form, meta),
            viewFields.custom_fields(form, meta),
            viewFields.fields_to_save(form, meta),
            viewFields.with_aup(form, meta),
            viewFields.aup_template(form, meta),
            viewFields.signup_template(form, meta),
            viewFields.forced_sponsor(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'FixedRole':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.stone_roles(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Message':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.message(form, meta),
            viewFields.template(form, meta),
            viewFields.skipable(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Provisioning':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.skipable(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Root':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.modules(form, meta)
          ]
        }
      ]
    case 'SelectRole':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.admin_role(form, meta),
            viewFields.list_role(form, meta),
            viewFields.template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'ShowLocalAccount':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.template(form, meta),
            viewFields.skipable(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'SSL_Inspection':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.ssl_path(form, meta),
            viewFields.ssl_mobileconfig_path(form, meta),
            viewFields.skipable(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'Survey':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.survey_id(form, meta),
            viewFields.template(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    case 'URL':
      return [
        {
          tab: null, // ignore tabs
          rows: [
            viewFields.id(form, meta),
            viewFields.description(form, meta),
            viewFields.skipable(form, meta),
            viewFields.url(form, meta),
            viewFields.actions(form, meta)
          ]
        }
      ]
    default:
      return [{}]
  }
}

export const validatorFields = {
  id: (form = {}, meta = {}) => {
    const {
      isNew = false,
      isClone = false
    } = meta
    return {
      id: {
        ...pfConfigurationValidatorsFromMeta(meta, 'id', i18n.t('Name')),
        ...{
          [i18n.t('Portal module exists.')]: not(and(required, conditional(isNew || isClone), hasPortalModules, portalModuleExists))
        }
      }
    }
  },
  actions: (form = {}, meta = {}) => {
    const {
      actions = []
    } = form
    return {
      actions: {
        $each: {
          type: {
            [i18n.t('Action required.')]: required,
            [i18n.t('Duplicate action.')]: conditional((value) => !(actions.filter(action => action && action.type === value).length > 1))
          },
          value: {
            [i18n.t('Value required.')]: required
          }
        }
      }
    }
  },
  admin_role: (form = {}, meta = {}) => {
    return { admin_role: pfConfigurationValidatorsFromMeta(meta, 'admin_role', i18n.t('Role')) }
  },
  aup_template: (form = {}, meta = {}) => {
    return { aup_template: pfConfigurationValidatorsFromMeta(meta, 'aup_template', i18n.t('Template')) }
  },
  custom_fields: (form = {}, meta = {}) => {
    return { custom_fields: pfConfigurationValidatorsFromMeta(meta, 'custom_fields', i18n.t('Fields')) }
  },
  description: (form = {}, meta = {}) => {
    return { description: pfConfigurationValidatorsFromMeta(meta, 'description', i18n.t('Description')) }
  },
  fields_to_save: (form = {}, meta = {}) => {
    return { fields_to_save: pfConfigurationValidatorsFromMeta(meta, 'fields_to_save', i18n.t('Fields')) }
  },
  forced_sponsor: (form = {}, meta = {}) => {
    return { forced_sponsor: pfConfigurationValidatorsFromMeta(meta, 'forced_sponsor', i18n.t('Email')) }
  },
  landing_template: (form = {}, meta = {}) => {
    return { landing_template: pfConfigurationValidatorsFromMeta(meta, 'landing_template', i18n.t('Template')) }
  },
  list_role: (form = {}, meta = {}) => {
    return { list_role: pfConfigurationValidatorsFromMeta(meta, 'list_role', i18n.t('Role')) }
  },
  message: (form = {}, meta = {}) => {
    return { message: pfConfigurationValidatorsFromMeta(meta, 'message', i18n.t('Message')) }
  },
  modules: (form = {}, meta = {}) => {
    const {
      modules = []
    } = form
    return {
      modules: {
        $each: {
          ...pfConfigurationValidatorsFromMeta(meta, 'modules', i18n.t('Module')),
          ...{
            [i18n.t('Module required.')]: required,
            [i18n.t('Duplicate module.')]: conditional((value) => !(modules.filter(v => v === value).length > 1))
          }
        }
      }
    }
  },
  multi_source_ids: (form = {}, meta = {}) => {
    const {
      multi_source_ids = []
    } = form
    return {
      multi_source_ids: {
        $each: {
          ...pfConfigurationValidatorsFromMeta(meta, 'multi_source_ids', i18n.t('Source')),
          ...{
            [i18n.t('Source required.')]: required,
            [i18n.t('Duplicate source.')]: conditional((value) => !(multi_source_ids.filter(v => v === value).length > 1))
          }
        }
      }
    }
  },
  multi_source_auth_classes: (form = {}, meta = {}) => {
    return { multi_source_auth_classes: pfConfigurationValidatorsFromMeta(meta, 'multi_source_auth_classes', i18n.t('Classes')) }
  },
  multi_source_object_classes: (form = {}, meta = {}) => {
    return { multi_source_object_classes: pfConfigurationValidatorsFromMeta(meta, 'multi_source_object_classes', i18n.t('Classes')) }
  },
  multi_source_types: (form = {}, meta = {}) => {
    return { multi_source_types: pfConfigurationValidatorsFromMeta(meta, 'multi_source_types', i18n.t('Types')) }
  },
  pid_field: (form = {}, meta = {}) => {
    return { pid_field: pfConfigurationValidatorsFromMeta(meta, 'pid_field', 'PID') }
  },
  show_first_module_on_default: (form = {}, meta = {}) => {},
  signup_template: (form = {}, meta = {}) => {
    return { signup_template: pfConfigurationValidatorsFromMeta(meta, 'signup_template', 'Template') }
  },
  skipable: (form = {}, meta = {}) => {},
  source_id: (form = {}, meta = {}) => {},
  ssl_mobileconfig_path: (form = {}, meta = {}) => {
    return { ssl_mobileconfig_path: pfConfigurationValidatorsFromMeta(meta, 'ssl_mobileconfig_path', 'SSL iOS profile URL') }
  },
  ssl_path: (form = {}, meta = {}) => {
    return { ssl_path: pfConfigurationValidatorsFromMeta(meta, 'ssl_path', 'SSL Certificate URL') }
  },
  stone_roles: (form = {}, meta = {}) => {
    return { stone_roles: pfConfigurationValidatorsFromMeta(meta, 'stone_roles', i18n.t('Role')) }
  },
  survey_id: (form = {}, meta = {}) => {
    return { survey_id: pfConfigurationValidatorsFromMeta(meta, 'survey_id', i18n.t('Survey')) }
  },
  template: (form = {}, meta = {}) => {
    return { template: pfConfigurationValidatorsFromMeta(meta, 'template', 'Template') }
  },
  url: (form = {}, meta = {}) => {
    return { url: pfConfigurationValidatorsFromMeta(meta, 'url', 'URL') }
  },
  username: (form = {}, meta = {}) => {
    return { username: pfConfigurationValidatorsFromMeta(meta, 'username', 'Username') }
  },
  with_aup: (form = {}, meta = {}) => {}
}

export const validators = (form = {}, meta = {}) => {
  const {
    moduleType = null
  } = meta
  switch (moduleType) {
    case 'Choice':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.show_first_module_on_default(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.actions(form, meta),
        ...validatorFields.modules(form, meta)
      }
    case 'Chained':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.actions(form, meta),
        ...validatorFields.modules(form, meta)
      }
    case 'Authentication::Billing':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        // ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.multi_source_ids(form, meta)
      }
    case 'Authentication::Blackhole':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.template(form, meta)
      }
    case 'Authentication::Choice':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        // ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.actions(form, meta),
        ...validatorFields.modules(form, meta),
        ...validatorFields.multi_source_ids(form, meta),
        ...validatorFields.multi_source_object_classes(form, meta),
        ...validatorFields.multi_source_types(form, meta),
        ...validatorFields.multi_source_auth_classes(form, meta)
      }
    case 'Authentication::Email':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Authentication::Login':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        // ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.actions(form, meta),
        ...validatorFields.multi_source_ids(form, meta)
      }
    case 'Authentication::Null':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    // "Authentication::OAuth"
    case 'Authentication::OAuth::Facebook':
    case 'Authentication::OAuth::Github':
    case 'Authentication::OAuth::Google':
    case 'Authentication::OAuth::Instagram':
    case 'Authentication::OAuth::LinkedIn':
    case 'Authentication::OAuth::OpenID':
    case 'Authentication::OAuth::Pinterest':
    case 'Authentication::OAuth::Twitter':
    case 'Authentication::OAuth::WindowsLive':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.landing_template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Authentication::Password':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        // ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.username(form, meta),
        ...validatorFields.actions(form, meta),
        ...validatorFields.multi_source_ids(form, meta)
      }
    case 'Authentication::SAML':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Authentication::SMS':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Authentication::Sponsor':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.pid_field(form, meta),
        ...validatorFields.source_id(form, meta),
        ...validatorFields.custom_fields(form, meta),
        ...validatorFields.fields_to_save(form, meta),
        ...validatorFields.with_aup(form, meta),
        ...validatorFields.aup_template(form, meta),
        ...validatorFields.signup_template(form, meta),
        ...validatorFields.forced_sponsor(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'FixedRole':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.stone_roles(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Message':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.message(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.skipable(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Provisioning':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.skipable(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Root':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.modules(form, meta)
      }
    case 'SelectRole':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.admin_role(form, meta),
        ...validatorFields.list_role(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'ShowLocalAccount':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.skipable(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'SSL_Inspection':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.ssl_path(form, meta),
        ...validatorFields.ssl_mobileconfig_path(form, meta),
        ...validatorFields.skipable(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'Survey':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.survey_id(form, meta),
        ...validatorFields.template(form, meta),
        ...validatorFields.actions(form, meta)
      }
    case 'URL':
      return {
        ...validatorFields.id(form, meta),
        ...validatorFields.description(form, meta),
        ...validatorFields.skipable(form, meta),
        ...validatorFields.url(form, meta),
        ...validatorFields.actions(form, meta)
      }
    default:
      return {}
  }
}
