<template>
  <b-card no-body>
    <b-card-header>
      <h4 class="mb-0" v-t="'Import Users'"></h4>
    </b-card-header>
    <div class="card-body p-0">
      <b-tabs ref="tabs" v-model="tabIndex" card pills>
        <b-tab v-for="(file, index) in files" :key="file.name + file.lastModified"
          :title="file.name" :title-link-class="(tabIndex === index) ? ['bg-primary', 'text-light'] : ['bg-light', 'text-primary']"
          no-body
        >
          <template v-slot:title>
            <b-button-close class="ml-2" :class="(tabIndex === index) ? 'text-white' : 'text-primary'" @click.stop.prevent="closeFile(index)" v-b-tooltip.hover.left.d300 :title="$t('Close File')">
              <icon name="times" class="align-top ml-1"></icon>
            </b-button-close>
            {{ file.name }}
          </template>
          <pf-csv-import
            :ref="'import-' + index"
            :file="file"
            :fields="fields"
            :store-name="storeName"
            :events-listen="tabIndex === index"
            :is-loading="isLoading"
            :is-slot-error="$v.$invalid"
            :import-promise="importPromise"
            hover
            striped
          >
            <b-card no-body>
              <b-card-header>
                <h4 v-t="'Additional User Options'"></h4>
                <p class="mb-0" v-t="'Complete the following additional static fields.'"></p>
              </b-card-header>
              <div class="card-body">
                <b-form-group label-cols="3" :label="$t('Registration Window')">
                  <b-row>
                    <b-col>
                      <pf-form-datetime v-model="localUser.valid_from"
                        :min="new Date()"
                        :config="{datetimeFormat: 'YYYY-MM-DD'}"
                        :vuelidate="$v.localUser.valid_from"
                      />
                    </b-col>
                    <p class="pt-2"><icon name="long-arrow-alt-right"></icon></p>
                    <b-col>
                      <pf-form-datetime v-model="localUser.expiration"
                        :min="new Date()"
                        :config="{datetimeFormat: 'YYYY-MM-DD'}"
                        :vuelidate="$v.localUser.expiration"
                      />
                    </b-col>
                  </b-row>
                </b-form-group>
                <pf-form-fields
                  v-model="localUser.actions"
                  :column-label="$t('Actions')"
                  :button-label="$t('Add Action')"
                  :field="actionField"
                  :vuelidate="$v.localUser.actions"
                  :invalid-feedback="[
                    { [$t('One or more errors exist.')]: $v.localUser.actions.$invalid }
                  ]"
                  @validations="actionsValidations = $event"
                  sortable
                ></pf-form-fields>
                <pf-form-row align-v="start" :column-label="$t('Password Options')">
                  <b-alert show variant="info">
                    {{ $t('When no password is imported, a random password is generated using the following criteria.') }}
                  </b-alert>
                  <b-row>
                    <b-col cols="6">
                      <pf-form-input class="p-0" type="range" min="6" max="32"
                        v-model="passwordGenerator.pwlength"
                        :column-label="$t('Length')"
                        :text="$t('{count} characters', { count: passwordGenerator.pwlength })"/>
                      <pf-form-toggle
                        v-model="passwordGenerator.upper"
                        :column-label="$t('Uppercase')"
                        :text="$t('Include uppercase characters')">ABC</pf-form-toggle>
                      <pf-form-toggle
                        v-model="passwordGenerator.lower"
                        :column-label="$t('Lowercase')"
                        :text="$t('Include lowercase characters')">abc</pf-form-toggle>
                      <pf-form-toggle
                        v-model="passwordGenerator.digits"
                        :column-label="$t('Digits')"
                        :text="$t('Include digits')">123</pf-form-toggle>
                    </b-col>
                    <b-col cols="6">
                      <pf-form-toggle
                        v-model="passwordGenerator.special"
                        :column-label="$t('Special')"
                        :text="$t('Include special characters')">!@#</pf-form-toggle>
                      <pf-form-toggle
                        v-model="passwordGenerator.brackets"
                        :column-label="$t('Brackets/Parenthesis')"
                        :text="$t('Include brackets')">({&lt;</pf-form-toggle>
                      <pf-form-toggle
                        v-model="passwordGenerator.high"
                        :column-label="$t('Accentuated')"
                        :text="$t('Include accentuated characters')">äæ±</pf-form-toggle>
                      <pf-form-toggle
                        v-model="passwordGenerator.ambiguous"
                        :column-label="$t('Ambiguous')"
                        :text="$t('Include ambiguous characters')">0Oo</pf-form-toggle>
                    </b-col>
                  </b-row>
                </pf-form-row>
              </div>
            </b-card>

          </pf-csv-import>
        </b-tab>
        <template v-slot:tabs-end>
          <pf-form-upload @files="files = $event" @focus="tabIndex = $event" :multiple="true" :cumulative="true" accept="text/*, .csv">{{ $t('Open CSV File') }}</pf-form-upload>
        </template>
        <template v-slot:empty>
          <div class="text-center text-muted">
            <b-container class="my-5">
              <b-row class="justify-content-md-center text-secondary">
                  <b-col cols="12" md="auto">
                    <icon v-if="isLoading" name="sync" scale="2" spin></icon>
                    <b-media v-else>
                      <template v-slot:aside><icon name="file" scale="2"></icon></template>
                      <h4>{{ $t('There are no open CSV files') }}</h4>
                    </b-media>
                  </b-col>
              </b-row>
            </b-container>
          </div>
        </template>
      </b-tabs>
    </div>
    <users-preview-modal v-model="showUsersPreviewModal" :store-name="storeName" />
  </b-card>
</template>

<script>
import { format } from 'date-fns'
import pfCSVImport from '@/components/pfCSVImport'
import pfFieldTypeValue from '@/components/pfFieldTypeValue'
import pfFormDatetime from '@/components/pfFormDatetime'
import pfFormFields from '@/components/pfFormFields'
import pfFormInput from '@/components/pfFormInput'
import pfFormRow from '@/components/pfFormRow'
import pfFormToggle from '@/components/pfFormToggle'
import pfFormUpload from '@/components/pfFormUpload'
import UsersPreviewModal from './UsersPreviewModal'
import { pfConfigurationActions } from '@/globals/configuration/pfConfiguration'
import {
  pfDatabaseSchema as schema,
  buildValidationFromColumnSchemas
} from '@/globals/pfDatabaseSchema'
import { pfFieldType as fieldType } from '@/globals/pfField'
import { pfFormatters as formatter } from '@/globals/pfFormatters'
import password from '@/utils/password'
import {
  required
} from 'vuelidate/lib/validators'
import {
  and,
  not,
  conditional,
  compareDate,
  sourceExists
} from '@/globals/pfValidators'

const { validationMixin } = require('vuelidate')

export default {
  name: 'users-import',
  components: {
    'pf-csv-import': pfCSVImport,
    pfFormDatetime,
    pfFormFields,
    pfFormInput,
    pfFormRow,
    pfFormToggle,
    pfFormUpload,
    UsersPreviewModal
  },
  mixins: [
    validationMixin
  ],
  props: {
    storeName: { // from router
      type: String,
      default: null,
      required: true
    }
  },
  data () {
    return {
      files: [],
      tabIndex: 0,
      fields: [
        {
          value: 'pid',
          text: this.$i18n.t('PID'),
          types: [fieldType.SUBSTRING],
          required: true,
          validators: buildValidationFromColumnSchemas(schema.person.pid, { required })
        },
        {
          value: 'password',
          text: this.$i18n.t('Password'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.password.password)
        },
        {
          value: 'title',
          text: this.$i18n.t('Title'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.title)
        },
        {
          value: 'firstname',
          text: this.$i18n.t('First Name'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.firstname)
        },
        {
          value: 'lastname',
          text: this.$i18n.t('Last Name'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.lastname)
        },
        {
          value: 'nickname',
          text: this.$i18n.t('Nickname'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.nickname)
        },
        {
          value: 'email',
          text: this.$i18n.t('Email'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.email)
        },
        {
          value: 'sponsor',
          text: this.$i18n.t('Sponsor'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.sponsor)
        },
        {
          value: 'anniversary',
          text: this.$i18n.t('Anniversary'),
          types: [fieldType.DATE],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.anniversary)
        },
        {
          value: 'birthday',
          text: this.$i18n.t('Birthday'),
          types: [fieldType.DATE],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.birthday)
        },
        {
          value: 'address',
          text: this.$i18n.t('Address'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.address)
        },
        {
          value: 'apartment_number',
          text: this.$i18n.t('Apartment Number'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.apartment_number)
        },
        {
          value: 'building_number',
          text: this.$i18n.t('Building Number'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.building_number)
        },
        {
          value: 'room_number',
          text: this.$i18n.t('Room Number'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.room_number)
        },
        {
          value: 'company',
          text: this.$i18n.t('Company'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.company)
        },
        {
          value: 'gender',
          text: this.$i18n.t('Gender'),
          types: [fieldType.GENDER],
          required: false,
          formatter: formatter.genderFromString,
          validators: buildValidationFromColumnSchemas(schema.person.gender)
        },
        {
          value: 'lang',
          text: this.$i18n.t('Language'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.lang)
        },
        {
          value: 'notes',
          text: this.$i18n.t('Notes'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.notes)
        },
        {
          value: 'portal',
          text: this.$i18n.t('Portal'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.portal)
        },
        {
          value: 'psk',
          text: this.$i18n.t('PSK'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.psk)
        },
        {
          value: 'source',
          text: this.$i18n.t('Source'),
          types: [fieldType.SOURCE],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.source, { [this.$i18n.t('Invalid source.')]: sourceExists })
        },
        {
          value: 'telephone',
          text: this.$i18n.t('Telephone'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.telephone)
        },
        {
          value: 'cell_phone',
          text: this.$i18n.t('Cellular Phone'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.cell_phone)
        },
        {
          value: 'work_phone',
          text: this.$i18n.t('Work Phone'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.work_phone)
        },
        {
          value: 'custom_field_1',
          text: this.$i18n.t('Custom Field 1'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_1)
        },
        {
          value: 'custom_field_2',
          text: this.$i18n.t('Custom Field 2'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_2)
        },
        {
          value: 'custom_field_3',
          text: this.$i18n.t('Custom Field 3'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_3)
        },
        {
          value: 'custom_field_4',
          text: this.$i18n.t('Custom Field 4'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_4)
        },
        {
          value: 'custom_field_5',
          text: this.$i18n.t('Custom Field 5'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_5)
        },
        {
          value: 'custom_field_6',
          text: this.$i18n.t('Custom Field 6'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_6)
        },
        {
          value: 'custom_field_7',
          text: this.$i18n.t('Custom Field 7'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_7)
        },
        {
          value: 'custom_field_8',
          text: this.$i18n.t('Custom Field 8'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_8)
        },
        {
          value: 'custom_field_9',
          text: this.$i18n.t('Custom Field 9'),
          types: [fieldType.SUBSTRING],
          required: false,
          validators: buildValidationFromColumnSchemas(schema.person.custom_field_9)
        }
      ],
      localUser: {
        valid_from: format(new Date(), 'YYYY-MM-DD'),
        expiration: null,
        actions: []
      },
      showUsersPreviewModal: false,
      passwordGenerator: {
        pwlength: 8,
        upper: true,
        lower: true,
        digits: true,
        special: false,
        brackets: false,
        high: false,
        ambiguous: false
      },
      actionField: {
        component: pfFieldTypeValue,
        attrs: {
          typeLabel: this.$i18n.t('Select action type'),
          valueLabel: this.$i18n.t('Select action value'),
          fields: [
            pfConfigurationActions.set_access_duration_by_acl_user,
            pfConfigurationActions.set_access_level_by_acl_user,
            pfConfigurationActions.mark_as_sponsor,
            pfConfigurationActions.set_role_by_acl_user,
            pfConfigurationActions.set_access_durations,
            pfConfigurationActions.set_tenant_id,
            pfConfigurationActions.set_unreg_date_by_acl_user
          ]
        }
      },
      actionsValidations: {},
      isLoading: false,
      createdUsers: {}
    }
  },
  methods: {
    abortFile (index) {
      this.files[index].reader.abort()
    },
    closeFile (index) {
      const file = this.files[index]
      file.close()
    },
    importPromise (payload, dryRun) {
      return new Promise((resolve, reject) => {
        if ('items' in payload) {
          payload.items = payload.items.map(item => { // glue payload together with local slot
            let merged = { ...item, ...this.localUser }
            if (!('password' in merged)) { // generate a unique password
              merged.password = password.generate(this.passwordGenerator)
            }
            return merged
          })
        }
        this.$store.dispatch(`${this.storeName}/bulkImport`, payload).then(result => {
          // do something with the result, then Promise.resolve to continue processing
          if (!dryRun) {
            this.createdUsers = result.reduce((createdUsers, result) => {
              const { item } = result
              if ('pid' in item) {
                createdUsers[item.pid] = (item.pid in createdUsers)
                  ? { ...createdUsers[item.pid], ...item }
                  : item
              }
              return createdUsers
            }, this.createdUsers)
            if (!result || result.length === 0) { // empty result when processing is completed
              if (Object.values(this.createdUsers).length > 0) {
                this.$store.commit(`${this.storeName}/CREATED_USERS_REPLACED`, Object.values(this.createdUsers))
                this.showUsersPreviewModal = true
              }
            }
          }
          resolve(result)
        }).catch(err => {
          // do something with the error, then Promise.reject to stop processing
          reject(err)
        })
      })
    }
  },
  created () {
    this.$store.dispatch('config/getSources')
  },
  validations () {
    return {
      localUser: {
        valid_from: {
          [this.$i18n.t('Start date required.')]: conditional(!!this.localUser.valid_from && this.localUser.valid_from !== '0000-00-00'),
          [this.$i18n.t('Date must be today or later.')]: compareDate('>=', new Date(), 'YYYY-MM-DD'),
          [this.$i18n.t('Date must be less than or equal to end date.')]: not(and(required, conditional(this.localUser.valid_from), not(compareDate('<=', this.localUser.expiration, 'YYYY-MM-DD'))))
        },
        expiration: {
          [this.$i18n.t('End date required.')]: conditional(!!this.localUser.expiration && this.localUser.expiration !== '0000-00-00'),
          [this.$i18n.t('Date must be today or later.')]: compareDate('>=', new Date(), 'YYYY-MM-DD'),
          [this.$i18n.t('Date must be greater than or equal to start date.')]: not(and(required, conditional(this.localUser.expiration), not(compareDate('>=', this.localUser.valid_from, 'YYYY-MM-DD'))))
        },
        actions: this.actionsValidations
      }
    }
  }
}
</script>

<style lang="scss">
.nav-tabs > li > a,
.nav-pills > li > a {
  margin-right: 0.5rem!important;
}
</style>
