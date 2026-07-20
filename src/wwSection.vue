<template>
  <div class="vd-root" :class="themeClass" :style="rootStyle">
   <div class="vd-inner">
    <!-- ============================ HEADER ============================ -->
    <header class="vd-header">
      <div class="vd-header__bar">
        <button class="vd-iconbtn" type="button" aria-label="Back" @click="emit('back')">
          <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('arrow-left')"></path></svg>
        </button>
        <div class="vd-menu">
          <button class="vd-iconbtn" type="button" aria-label="Actions" @click="menuOpen = !menuOpen">
            <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('more')"></path></svg>
          </button>
          <div v-if="menuOpen" class="vd-menu__pop vd-menu__pop--left" @click.self="menuOpen = false">
            <button type="button" class="vd-menu__item" @click="act('sendText')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('message')"></path></svg> Send A Text</button>
            <button type="button" class="vd-menu__item" @click="act('sendEmail')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg> Send An Email</button>
            <div class="vd-menu__sep"></div>
            <button type="button" class="vd-menu__item vd-menu__item--warn" @click="act('setInactive')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('slash')"></path></svg> Inactive</button>
            <button type="button" class="vd-menu__item vd-menu__item--warn" @click="act('terminate')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('slash')"></path></svg> Terminate</button>
            <button type="button" class="vd-menu__item vd-menu__item--danger" @click="act('deleteVendor')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('trash')"></path></svg> Delete</button>
          </div>
        </div>
      </div>

      <div class="vd-header__id">
        <span class="vd-avatar vd-avatar--lg">
          <img v-if="vendorAvatar" :src="vendorAvatar" :alt="vendorName" />
          <template v-else>{{ initials(vendorName) || 'V' }}</template>
        </span>
        <div class="vd-header__idmeta">
          <h1 class="vd-header__name">{{ vendorName || 'Vendor' }}</h1>
          <div class="vd-badgerow">
            <span v-if="vendorStatus" class="vd-pill" :class="`vd-pill--${statusKey(vendorStatus)}`"><span class="vd-pill__dot"></span>{{ prettyStatus(vendorStatus) }}</span>
          </div>
        </div>
      </div>

      <div class="vd-card vd-contactcard">
        <a v-if="vendorField('home_address')" class="vd-contact" :href="mapHref" target="_blank" rel="noopener noreferrer">
          <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('map-pin')"></path></svg>
          <span>{{ vendorField('home_address') }}</span>
        </a>
        <div v-if="vendorField('category') || vendorField('role')" class="vd-contact vd-contact--static">
          <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('globe')"></path></svg>
          <span>{{ vendorField('category') || vendorField('role') }}</span>
        </div>
        <a v-if="vendorField('email')" class="vd-contact" :href="`mailto:${vendorField('email')}`">
          <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg>
          <span>{{ vendorField('email') }}</span>
        </a>
        <a v-if="vendorField('phone')" class="vd-contact" :href="`tel:${vendorField('phone')}`">
          <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('phone')"></path></svg>
          <span>{{ vendorField('phone') }}</span>
        </a>
      </div>
    </header>

    <!-- ============================ TAB BAR ============================ -->
    <nav class="vd-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="vd-tab"
        :class="{ 'vd-tab--active': activeTab === tab.key }"
        type="button" role="tab" :aria-selected="activeTab === tab.key"
        @click="selectTab(tab.key)"
      >
        <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic(tab.icon)"></path></svg>
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <div class="vd-panel">
      <!-- ======================= ONBOARDING ======================= -->
      <section v-if="activeTab === 'onboarding'" class="vd-tabpane">
        <div class="vd-card">
          <h2 class="vd-card__heading vd-card__heading--lg">Onboarding</h2>
          <div class="vd-pipeline">
            <button
              v-for="(st, i) in stages" :key="st.value || i"
              type="button"
              class="vd-stage"
              :class="{ 'vd-stage--done': i < currentStageIndex, 'vd-stage--current': i === currentStageIndex }"
              @click="emitStage(st, i)"
            >
              <span class="vd-stage__dot">
                <svg v-if="i < currentStageIndex" class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg>
                <span v-else class="vd-stage__num">{{ i + 1 }}</span>
              </span>
              <span class="vd-stage__label">{{ st.label }}</span>
            </button>
          </div>
        </div>

        <div class="vd-card">
          <h3 class="vd-card__heading">{{ content.onboardingItemsTitle || 'Onboarding Items' }}</h3>
          <p class="vd-card__sub">{{ content.onboardingItemsSub || 'Complete the following documents to proceed with the onboarding process.' }}</p>
          <ul v-if="onboardingItems.length" class="vd-checklist">
            <li v-for="(it, i) in onboardingItems" :key="i" class="vd-checkitem" @click="emitItem('onboardingItemClick', i, it)">
              <span class="vd-checkitem__icon" :class="`vd-text--${obTone(it)}`">
                <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic(obTone(it) === 'success' ? 'check-circle' : 'alert-circle')"></path></svg>
              </span>
              <div class="vd-checkitem__body">
                <strong class="vd-checkitem__title">{{ rowVal(it, ['title','label','name']) }}</strong>
                <span class="vd-checkitem__desc">{{ rowVal(it, ['description','desc','instructions']) }}</span>
              </div>
              <span class="vd-pill" :class="`vd-pill--${obTone(it)}`">{{ prettyStatus(rowVal(it, ['status']) || 'Not Submitted') }}</span>
            </li>
          </ul>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('clipboard')"></path></svg><span>No onboarding items</span></div>
        </div>
      </section>

      <!-- ======================= DETAILS ======================= -->
      <section v-else-if="activeTab === 'details'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header">
            <h2 class="vd-card__heading vd-card__heading--lg">Details</h2>
          </div>
          <div class="vd-detailgrid">
            <div v-for="f in detailFields" :key="f.key" class="vd-kv" :class="{ 'vd-kv--editing': editingKey === f.key, 'vd-kv--wide': f.type === 'multiline' }">
              <span class="vd-kv__label">{{ f.label }}</span>
              <div class="vd-kv__body">
                <template v-if="editingKey === f.key">
                  <!-- select -->
                  <template v-if="f.type === 'select'">
                    <div class="vd-optionlist">
                      <button v-for="opt in optionsFor(f)" :key="String(opt.value)" type="button" class="vd-optionlist__item"
                        :class="{ 'vd-optionlist__item--active': String(opt.value) === String(editValue) }" @click="pickOption(f, opt)">
                        <span class="vd-optionlist__label">{{ opt.label }}</span>
                        <svg v-if="String(opt.value) === String(editValue)" class="vd-svg vd-optionlist__check" v-bind="svgAttrs"><path :d="ic('check')"></path></svg>
                      </button>
                      <div v-if="!optionsFor(f).length" class="vd-optionlist__empty">No options bound</div>
                    </div>
                    <div class="vd-editactions">
                      <button type="button" class="vd-iconbtn2 vd-iconbtn2--save" :disabled="editValue === '' || editValue == null" @click="saveEdit(f)" title="Save"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg></button>
                      <button type="button" class="vd-iconbtn2" @click="cancelEdit" title="Cancel"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
                    </div>
                  </template>
                  <!-- tags / multiselect -->
                  <template v-else-if="f.type === 'tags'">
                    <input class="vd-input vd-tagsearch" v-model="tagQuery" ref="editor" placeholder="Search options…" @keydown.esc="cancelEdit" />
                    <div class="vd-tagpicker">
                      <button v-for="opt in filteredOptions(f)" :key="String(opt.value)" type="button" class="vd-tagopt"
                        :class="{ 'vd-tagopt--on': editArray.some(v => String(v) === String(opt.value)) }" @click="toggleTag(opt)">
                        <svg v-if="editArray.some(v => String(v) === String(opt.value))" class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg>
                        {{ opt.label }}
                      </button>
                      <div v-if="!optionsFor(f).length" class="vd-optionlist__empty">No options bound</div>
                      <div v-else-if="!filteredOptions(f).length" class="vd-optionlist__empty">No matches</div>
                    </div>
                    <div class="vd-editactions">
                      <button type="button" class="vd-iconbtn2 vd-iconbtn2--save" @click="saveTags(f)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg></button>
                      <button type="button" class="vd-iconbtn2" @click="cancelEdit"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
                    </div>
                  </template>
                  <!-- text / multiline / date -->
                  <template v-else>
                    <textarea v-if="f.type === 'multiline'" class="vd-input vd-input--area" v-model="editValue" ref="editor" rows="3" @keydown.esc="cancelEdit"></textarea>
                    <input v-else class="vd-input" :type="f.type === 'date' ? 'date' : (f.type === 'email' ? 'email' : 'text')"
                      v-model="editValue" ref="editor" :placeholder="f.label" @keydown.enter="saveEdit(f)" @keydown.esc="cancelEdit" />
                    <div class="vd-editactions">
                      <button type="button" class="vd-iconbtn2 vd-iconbtn2--save" @click="saveEdit(f)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg></button>
                      <button type="button" class="vd-iconbtn2" @click="cancelEdit"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <div v-if="f.type === 'tags'" class="vd-tags" :class="{ 'vd-muted': !displayTags(f).length }">
                    <span v-for="(t, ti) in displayTags(f)" :key="ti" class="vd-tag">{{ t }}</span>
                    <span v-if="!displayTags(f).length">—</span>
                  </div>
                  <span v-else class="vd-kv__value" :class="{ 'vd-muted': !displayValue(f) }">{{ displayValue(f) || '—' }}</span>
                  <button v-if="content.allowInlineEdit !== false && f.editable !== false" type="button" class="vd-kv__edit" @click="startEdit(f)" aria-label="Edit">
                    <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('pencil')"></path></svg>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================= ACTIVITY (feed) ======================= -->
      <section v-else-if="activeTab === 'activity'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header"><h2 class="vd-card__heading vd-card__heading--lg">Activity</h2></div>

          <div v-if="content.showComposer !== false" class="pp-composer" :class="{ 'pp-composer--active': composerActive }">
            <span class="vd-avatar">
              <img v-if="currentAvatar" :src="currentAvatar" :alt="content.currentUserName || 'You'" />
              <template v-else>{{ initials(content.currentUserName) || 'You' }}</template>
            </span>
            <div class="pp-composer__main">
              <div class="pp-composer__inputwrap">
                <div ref="composer" class="pp-composer__input" contenteditable="true" role="textbox"
                  :data-placeholder="content.composerPlaceholder || 'Write a note…  type @ to mention someone'"
                  @input="onComposerInput" @keydown="onComposerKeydown" @keyup="onComposerKeyup" @click="detectMention" @focus="onComposerFocus" @paste="onPaste"></div>
                <div v-if="mentionOpen" class="pp-mentionmenu">
                  <button v-for="(u, mi) in filteredMentionUsers" :key="u.id != null && u.id !== '' ? u.id : mi" type="button"
                    class="pp-mentionitem" :class="{ 'pp-mentionitem--active': mi === mentionIndex }"
                    @mousedown.prevent="insertMention(u)" @mouseenter="mentionIndex = mi">
                    <span class="pp-mentionitem__avatar"><img v-if="u.avatar" :src="u.avatar" :alt="u.name" /><template v-else>{{ initials(u.name) }}</template></span>
                    <span class="pp-mentionitem__name">{{ u.name }}</span>
                  </button>
                  <div v-if="!filteredMentionUsers.length" class="pp-mentionmenu__empty">No people found</div>
                </div>
              </div>
              <div v-if="composerActive" class="pp-composer__foot">
                <div v-if="content.allowAttachments !== false" class="pp-drop" :class="{ 'pp-drop--over': dragActive }"
                  @dragover.prevent="dragActive = true" @dragleave.prevent="dragActive = false" @drop.prevent="onDrop" @click="triggerFile">
                  <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('file-plus')"></path></svg>
                  <span>{{ content.attachHint || 'Drop your attachment here or click to browse' }}</span>
                  <input ref="file" type="file" multiple class="pp-drop__input" @change="onFileInput" />
                </div>
                <div v-if="attachments.length" class="pp-attpreview">
                  <div v-for="(a, ai) in attachments" :key="ai" class="pp-attchip" :class="a.isImage ? 'pp-attchip--img' : 'pp-attchip--file'">
                    <img v-if="a.isImage && a.url" :src="a.url" :alt="a.name" />
                    <template v-else><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('file')"></path></svg><span class="pp-attchip__name">{{ a.name }}</span></template>
                    <button type="button" class="pp-attchip__x" @click.stop="removeAttachment(ai)" aria-label="Remove"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg></button>
                  </div>
                </div>
                <div class="pp-composer__actions">
                  <div class="pp-composer__spacer"></div>
                  <button type="button" class="vd-btn vd-btn--ghost" @click="cancelComposer">Cancel</button>
                  <button type="button" class="vd-btn vd-btn--primary" :disabled="composerEmpty && !attachments.length" @click="submitNote">
                    <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('send')"></path></svg> {{ content.submitLabel || 'Post Note' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ul v-if="activityItems.length" class="pp-feed">
            <li v-for="(f, i) in activityItems" :key="i" class="pp-feeditem" :class="{ 'pp-feeditem--last': i === activityItems.length - 1 }">
              <span class="vd-avatar" @click="emitItem('activityItemClick', i, f)">
                <img v-if="avatarUrl(f)" :src="avatarUrl(f)" :alt="authorName(f)" /><template v-else>{{ initials(authorName(f)) }}</template>
              </span>
              <div class="pp-feeditem__body">
                <div class="pp-feeditem__top">
                  <span class="pp-feeditem__head" @click="emitItem('activityItemClick', i, f)">
                    <strong>{{ authorName(f) || 'Unknown' }}</strong>
                    <span v-if="activityLabel(f)" class="pp-feeditem__activity">{{ activityLabel(f) }}</span>
                    <span class="vd-muted">{{ timeText(f) }}</span>
                  </span>
                  <button v-if="canDelete(f)" class="pp-feeditem__del" type="button" aria-label="Delete" @click.stop="emitActivityDelete(i, f)">
                    <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('trash')"></path></svg>
                  </button>
                </div>
                <template v-if="bodyText(f)">
                  <div v-if="content.renderHtml !== false" class="pp-feeditem__text" v-html="bodyText(f)"></div>
                  <p v-else class="pp-feeditem__text">{{ stripHtml(bodyText(f)) }}</p>
                </template>
                <div v-if="attachmentsOf(f).length" class="pp-atts">
                  <button v-for="(att, j) in attachmentsOf(f)" :key="j" type="button" class="pp-att" :class="isImage(att) ? 'pp-att--img' : 'pp-att--file'" :title="attName(att)" @click="emitAtt(i, j, att)">
                    <template v-if="isImage(att)"><img v-if="attThumb(att)" :src="attThumb(att)" :alt="attName(att)" /><svg v-else class="vd-svg" v-bind="svgAttrs"><path :d="ic('image')"></path></svg></template>
                    <template v-else><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('file')"></path></svg><span class="pp-att__name">{{ attName(att) }}</span></template>
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('rss')"></path></svg><span>No activity yet</span></div>
        </div>
      </section>

      <!-- ======================= BOX ======================= -->
      <section v-else-if="activeTab === 'box'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header">
            <h2 class="vd-card__heading vd-card__heading--lg">Box Files</h2>
            <a v-if="content.boxEmbedUrl" class="vd-btn vd-btn--ghost" :href="content.boxEmbedUrl" target="_blank" rel="noopener noreferrer">
              <svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('external')"></path></svg> Open in Box
            </a>
          </div>
          <div v-if="content.boxEmbedUrl" class="vd-boxframe">
            <iframe :src="content.boxEmbedUrl" frameborder="0" allowfullscreen title="Box folder"></iframe>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('box')"></path></svg><span>No Box folder linked</span></div>
        </div>
      </section>

      <!-- ======================= INQUIRIES ======================= -->
      <section v-else-if="activeTab === 'inquiries'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header">
            <div><h2 class="vd-card__heading vd-card__heading--lg">Inquiries</h2><p class="vd-card__sub">{{ tickets.length }} ticket{{ tickets.length === 1 ? '' : 's' }}</p></div>
            <button v-if="content.showNewTicket !== false" class="vd-btn vd-btn--primary" type="button" @click="emit('newTicket')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('plus')"></path></svg> New Ticket</button>
          </div>
          <div v-if="tickets.length" class="vd-table__wrap">
            <table class="vd-table">
              <thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th class="vd-num">Created</th></tr></thead>
              <tbody>
                <tr v-for="(t, i) in tickets" :key="i" @click="emitItem('ticketClick', i, t)">
                  <td><strong>#{{ rowVal(t, ['ticket_number','ticketNumber','id']) }}</strong></td>
                  <td>{{ rowVal(t, ['subject']) }}</td>
                  <td class="vd-muted">{{ rowVal(t, ['category']) || '—' }}</td>
                  <td><span v-if="rowVal(t, ['priority'])" class="vd-pill" :class="`vd-pill--${priorityKey(rowVal(t, ['priority']))}`">{{ rowVal(t, ['priority']) }}</span><span v-else class="vd-muted">—</span></td>
                  <td><span class="vd-pill" :class="`vd-pill--${statusKey(rowVal(t, ['status']))}`"><span class="vd-pill__dot"></span>{{ rowVal(t, ['status']) || 'open' }}</span></td>
                  <td class="vd-num vd-muted">{{ fmtDate(rowVal(t, ['created_at','createdAt'])) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('alert-circle')"></path></svg><span>No inquiries</span></div>
        </div>
      </section>

      <!-- ======================= JOBS ======================= -->
      <section v-else-if="activeTab === 'jobs'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header"><div><h2 class="vd-card__heading vd-card__heading--lg">Jobs</h2><p class="vd-card__sub">{{ jobs.length }} work order{{ jobs.length === 1 ? '' : 's' }}</p></div></div>
          <div v-if="jobs.length" class="vd-table__wrap">
            <table class="vd-table">
              <thead><tr><th>Title</th><th>Status</th><th>Address</th><th class="vd-num">Actions</th></tr></thead>
              <tbody>
                <tr v-for="(j, i) in jobs" :key="i">
                  <td><strong>{{ rowVal(j, ['display','title','name']) }}</strong></td>
                  <td><span class="vd-pill" :class="`vd-pill--${statusKey(rowVal(j, ['Status','status']))}`"><span class="vd-pill__dot"></span>{{ rowVal(j, ['Status','status']) || '—' }}</span></td>
                  <td class="vd-muted">{{ rowVal(j, ['address_string','address']) || '—' }}</td>
                  <td class="vd-num"><button type="button" class="vd-btn vd-btn--sm" @click="emitItem('jobClick', i, j)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('external')"></path></svg> View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('briefcase')"></path></svg><span>No jobs yet</span></div>
        </div>
      </section>

      <!-- ======================= INSURANCE & LICENSING ======================= -->
      <section v-else-if="activeTab === 'insurance'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header">
            <div><h2 class="vd-card__heading vd-card__heading--lg">Insurance</h2><p class="vd-card__sub">{{ insurances.length }} polic{{ insurances.length === 1 ? 'y' : 'ies' }}</p></div>
            <button type="button" class="vd-btn vd-btn--primary" @click="emit('addInsurance')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('plus')"></path></svg> Add Policy</button>
          </div>
          <div v-if="insurances.length" class="vd-table__wrap">
            <table class="vd-table">
              <thead><tr><th>Policy</th><th>Insurer</th><th>Policy #</th><th class="vd-num">Coverage</th><th>Status</th><th>Expires</th><th class="vd-num">Actions</th></tr></thead>
              <tbody>
                <tr v-for="(ins, i) in insurances" :key="i">
                  <td><strong>{{ rowVal(ins, ['policy_type']) || 'Policy' }}</strong></td>
                  <td class="vd-muted">{{ rowVal(ins, ['insurer_name']) || '—' }}</td>
                  <td class="vd-muted">{{ rowVal(ins, ['policy_number']) || '—' }}</td>
                  <td class="vd-num">{{ money(rowVal(ins, ['coverage_amount'])) }}</td>
                  <td><span class="vd-pill" :class="`vd-pill--${statusKey(rowVal(ins, ['status']))}`"><span class="vd-pill__dot"></span>{{ prettyStatus(rowVal(ins, ['status']) || 'pending') }}</span></td>
                  <td :class="{ 'vd-text--danger': isExpired(ins) }">{{ fmtDate(rowVal(ins, ['expiration_date'])) }}</td>
                  <td class="vd-num">
                    <div class="vd-rowactions">
                      <span v-if="isVerified(ins)" class="vd-verified"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('check-circle')"></path></svg> Verified</span>
                      <button v-else type="button" class="vd-btn vd-btn--sm" @click="emitItem('verifyInsurance', i, ins)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('check')"></path></svg> Verify</button>
                      <button type="button" class="vd-btn vd-btn--sm vd-btn--primary" @click="emitItem('insuranceClick', i, ins)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('external')"></path></svg> View</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('shield')"></path></svg><span>No insurance policies on file</span></div>
        </div>

        <div class="vd-card">
          <div class="vd-card__header">
            <h2 class="vd-card__heading vd-card__heading--lg">Licensing</h2>
            <button type="button" class="vd-btn vd-btn--primary" @click="emit('addLicense')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('plus')"></path></svg> Add License</button>
          </div>
          <div v-if="licenses.length" class="vd-table__wrap">
            <table class="vd-table">
              <thead><tr><th>License Type</th><th>Number</th><th>Status</th><th class="vd-num">Expires</th></tr></thead>
              <tbody>
                <tr v-for="(l, i) in licenses" :key="i" @click="emitItem('licenseClick', i, l)">
                  <td><strong>{{ rowVal(l, ['license_type','type','policy_type','name']) || 'License' }}</strong></td>
                  <td class="vd-muted">{{ rowVal(l, ['license_number','number','policy_number']) || '—' }}</td>
                  <td><span class="vd-pill" :class="`vd-pill--${statusKey(rowVal(l, ['status']))}`"><span class="vd-pill__dot"></span>{{ rowVal(l, ['status']) || '—' }}</span></td>
                  <td class="vd-num vd-muted">{{ fmtDate(rowVal(l, ['expiration_date','expires','expiry'])) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('award')"></path></svg><span>No licenses on file</span></div>
        </div>
      </section>

      <!-- ======================= REVIEWS ======================= -->
      <section v-else-if="activeTab === 'reviews'" class="vd-tabpane">
        <div class="vd-card vd-comingsoon">
          <span class="vd-comingsoon__icon"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('star')"></path></svg></span>
          <h2 class="vd-card__heading vd-card__heading--lg">Reviews</h2>
          <p class="vd-card__sub">Coming soon</p>
        </div>
      </section>

      <!-- ======================= PAYOUTS ======================= -->
      <section v-else-if="activeTab === 'payouts'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-card__header"><div><h2 class="vd-card__heading vd-card__heading--lg">Payouts</h2><p class="vd-card__sub">{{ payouts.length }} bill{{ payouts.length === 1 ? '' : 's' }}</p></div></div>
          <div v-if="payouts.length" class="vd-table__wrap">
            <table class="vd-table">
              <thead><tr><th>Remittance Name</th><th>Status</th><th>Address</th><th>Due Date</th><th class="vd-num">Amount</th><th class="vd-num">Actions</th></tr></thead>
              <tbody>
                <tr v-for="(p, i) in payouts" :key="i">
                  <td><strong>{{ rowVal(p, ['remittance_name','Remittance Name','name']) }}</strong></td>
                  <td><span class="vd-pill" :class="`vd-pill--${statusKey(rowVal(p, ['Status','status']))}`"><span class="vd-pill__dot"></span>{{ rowVal(p, ['Status','status']) || '—' }}</span></td>
                  <td class="vd-muted">{{ rowVal(p, ['address','Address CONCAT (from Projects)','address_string']) || '—' }}</td>
                  <td class="vd-muted">{{ fmtDate(rowVal(p, ['adjusted_due_date','Adjusted Due Date','due_date'])) }}</td>
                  <td class="vd-num vd-num--strong">{{ money(rowVal(p, ['amount','Amount'])) }}</td>
                  <td class="vd-num"><button type="button" class="vd-btn vd-btn--sm" @click="emitItem('payoutClick', i, p)"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('external')"></path></svg> View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="vd-empty"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('credit-card')"></path></svg><span>No payouts yet</span></div>
        </div>
      </section>

      <!-- ======================= USER ======================= -->
      <section v-else-if="activeTab === 'user'" class="vd-tabpane">
        <div class="vd-card">
          <div class="vd-usercard__head">
            <div class="vd-usercard__id">
              <span class="vd-avatar">{{ initials(userField('name') || vendorName) || 'U' }}</span>
              <div>
                <strong class="vd-usercard__name">{{ userField('name') || vendorName || 'User' }}</strong>
                <span class="vd-usercard__email">{{ userField('email') || vendorField('email') }}</span>
              </div>
            </div>
            <button type="button" class="vd-toggle" :class="{ 'vd-toggle--on': localUserActive }" role="switch" :aria-checked="localUserActive" @click="toggleUserActive">
              <span class="vd-toggle__track"><span class="vd-toggle__thumb"></span></span>
              <span class="vd-toggle__label">{{ localUserActive ? 'Active' : 'Inactive' }}</span>
            </button>
          </div>
          <div class="vd-detailgrid">
            <div class="vd-kv"><span class="vd-kv__label">Email</span><div class="vd-kv__body"><span class="vd-kv__value">{{ userField('email') || '—' }}</span></div></div>
            <div class="vd-kv"><span class="vd-kv__label">Phone</span><div class="vd-kv__body"><span class="vd-kv__value">{{ userField('phone') || '—' }}</span></div></div>
            <div class="vd-kv">
              <span class="vd-kv__label">Role</span>
              <div class="vd-kv__body">
                <select class="vd-select" :value="localRole" @change="changeRole($event.target.value)">
                  <option v-for="opt in roleOptions" :key="String(opt.value)" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>
            <div class="vd-kv"><span class="vd-kv__label">Last Login</span><div class="vd-kv__body"><span class="vd-kv__value">{{ fmtDateTime(userField('last_login') || userField('lastLogin')) || '—' }}</span></div></div>
          </div>
          <div class="vd-usercard__actions">
            <button type="button" class="vd-btn vd-btn--ghost" @click="emit('resetPassword')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('key')"></path></svg> Reset Password</button>
            <button type="button" class="vd-btn vd-btn--primary" @click="emit('sendMagicLink')"><svg class="vd-svg" v-bind="svgAttrs"><path :d="ic('mail')"></path></svg> Send Magic Link</button>
          </div>
        </div>
      </section>
    </div>
   </div>
  </div>
</template>

<script>
const ICONS = {
  "arrow-left": "M19 12H5M12 19l-7-7 7-7",
  more: "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  message: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  slash: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.93 4.93l14.14 14.14",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  check: "M20 6L9 17l-5-5",
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  "alert-circle": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
  pencil: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  x: "M18 6L6 18M6 6l12 12",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  plus: "M12 5v14M5 12h14",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  "file-plus": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M12 18v-6M9 15h6",
  image: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  rss: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12l8.73-5.04M12 22.08V12",
  briefcase: "M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 5h4v2h-4z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "credit-card": "M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM1 10h22",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3",
};

export default {
  // Declare every prop WeWeb injects so none fall through as attributes onto the
  // root element (stray fallthrough attrs can interfere with the editor overlay).
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: false },
    wwFrontState: { type: Object, required: false },
    wwElementState: { type: Object, required: false },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: false },
    /* wwEditor:end */
  },
  inheritAttrs: false,
  emits: ["trigger-event"],
  data() {
    return {
      activeTab: this.content.activeTab || "onboarding",
      menuOpen: false,
      // details inline edit
      editingKey: null,
      editValue: "",
      editArray: [],
      tagQuery: "",
      // feed composer
      composerOpen: false,
      composerEmpty: true,
      mentionCount: 0,
      mentionOpen: false,
      mentionQuery: "",
      mentionIndex: 0,
      mentionRange: null,
      attachments: [],
      dragActive: false,
      // user tab optimistic state
      localUserActive: false,
      localRole: "",
    };
  },
  created() { this.syncUserState(); },
  watch: {
    "content.activeTab"(v) { if (v) this.activeTab = v; },
    // Watch the RAW prop path (not a computed) and only assign primitives.
    // Watching a computed that returns a fresh object reference each evaluation
    // creates an update loop inside the WeWeb editor (content is re-proxied on
    // every interaction), which crashes with an emitsOptions error.
    "content.user": { handler() { this.syncUserState(); }, deep: false },
  },
  beforeUnmount() { this.attachments.forEach((a) => { if (a.url) try { URL.revokeObjectURL(a.url); } catch (e) {} }); },
  computed: {
    tabs() {
      if (Array.isArray(this.content.tabs) && this.content.tabs.length) return this.content.tabs;
      return [
        { key: "onboarding", label: "Onboarding", icon: "clipboard" },
        { key: "details", label: "Details", icon: "file" },
        { key: "activity", label: "Activity", icon: "rss" },
        { key: "box", label: "Box", icon: "box" },
        { key: "inquiries", label: "Inquiries", icon: "alert-circle" },
        { key: "jobs", label: "Jobs", icon: "briefcase" },
        { key: "insurance", label: "Insurance & Licensing", icon: "shield" },
        { key: "reviews", label: "Reviews", icon: "star" },
        { key: "payouts", label: "Payouts", icon: "credit-card" },
        { key: "user", label: "User", icon: "users" },
      ];
    },
    vendor() { return this.firstOf(this.content.vendor); },
    vendorName() { return this.vendorField("name") || this.vendorField("nickname") || ""; },
    vendorAvatar() { return this.imgUrl(this.vendorField("headshot") || this.vendorField("avatar") || this.vendorField("logo")); },
    vendorStatus() { return this.vendorField("status") || ""; },
    vendorStage() { return this.content.currentStage || this.vendorField("onboarding_status") || ""; },
    mapHref() {
      const a = this.vendorField("home_address");
      return a ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(a) : "#";
    },
    // ---- onboarding ----
    stages() {
      const src = Array.isArray(this.content.stages) && this.content.stages.length ? this.content.stages : [
        "Request", "Potential Provider", "Qualified/Interested", "Document Collection", "Onboarding Meeting", "New", "Active",
      ];
      return src.map((s) => (s && typeof s === "object" ? { label: s.label != null ? s.label : s.value, value: s.value != null ? s.value : s.label } : { label: String(s), value: String(s) }));
    },
    currentStageIndex() {
      const cur = String(this.vendorStage || "").toLowerCase().trim();
      if (!cur) return 0;
      const idx = this.stages.findIndex((s) => String(s.value).toLowerCase().trim() === cur || String(s.label).toLowerCase().trim() === cur);
      return idx < 0 ? 0 : idx;
    },
    onboardingItems() { return this.asArray(this.content.onboardingItems); },
    // ---- details ----
    detailFields() {
      if (Array.isArray(this.content.detailFields) && this.content.detailFields.length) return this.content.detailFields;
      return [
        { key: "email", label: "Email", type: "email" },
        { key: "nickname", label: "Nickname", type: "text" },
        { key: "category", label: "Category", type: "select", optionsProp: "categoryOptions" },
        { key: "primary_skills", label: "Primary Skills", type: "tags", optionsProp: "skillOptions" },
        { key: "secondary_skills", label: "Secondary Skills", type: "tags", optionsProp: "skillOptions" },
        { key: "markets", label: "Markets", type: "tags", optionsProp: "marketOptions" },
        { key: "lobs", label: "Lines of Business", type: "tags", optionsProp: "lobOptions" },
        { key: "phone", label: "Phone Number", type: "text" },
        { key: "home_address", label: "Address", type: "text" },
        { key: "dob", label: "Date of Birth", type: "date" },
        { key: "date_onboarded", label: "Date Onboarded", type: "date", editable: false },
        { key: "terms", label: "Terms", type: "select", optionsProp: "termOptions" },
        { key: "how_are_they_scheduled", label: "How Are They Scheduled", type: "select", optionsProp: "scheduleOptions" },
        { key: "price_guide_verified", label: "Price Guide Verified", type: "select", optionsProp: "priceGuideOptions" },
        { key: "status", label: "Status", type: "select", optionsProp: "statusOptions" },
        { key: "ap_email", label: "AP Email", type: "email" },
        { key: "email_used_for_payout", label: "Payout Email", type: "email" },
        { key: "notes", label: "Notes", type: "multiline" },
      ];
    },
    // ---- activity ----
    activityItems() { return this.asArray(this.content.activityItems); },
    mentionUsers() {
      let u = this.content.users;
      if (u && !Array.isArray(u) && Array.isArray(u.data)) u = u.data;
      if (!Array.isArray(u)) return [];
      const lf = this.content.userLabelField || "name";
      const vf = this.content.userValueField || "user_auth_id";
      const af = this.content.userAvatarField || "headshot";
      return u.map((o) => {
        if (o && typeof o === "object") {
          const id = o[vf] != null && o[vf] !== "" ? o[vf] : (o.user_auth_id != null && o.user_auth_id !== "" ? o.user_auth_id : (o.id != null ? o.id : ""));
          const name = String(o[lf] != null ? o[lf] : (o.name || o.label || ""));
          return { id, name, avatar: this.imgUrl(o[af]), raw: o };
        }
        return { id: o, name: String(o), avatar: "" };
      }).filter((x) => x.name);
    },
    filteredMentionUsers() {
      const q = String(this.mentionQuery || "").toLowerCase();
      const list = this.mentionUsers;
      if (!q) return list.slice(0, 8);
      return list.filter((u) => u.name.toLowerCase().indexOf(q) !== -1).slice(0, 8);
    },
    currentAvatar() { return this.imgUrl(this.content.currentUserAvatar); },
    composerActive() { return this.composerOpen || !this.composerEmpty || this.attachments.length > 0; },
    // ---- other tabs ----
    tickets() { return this.asArray(this.content.tickets); },
    jobs() { return this.asArray(this.content.jobs); },
    insurances() { return this.asArray(this.content.insurances); },
    licenses() { return this.asArray(this.content.licenses); },
    payouts() { return this.asArray(this.content.payouts); },
    // ---- user ----
    userObj() { return this.firstOf(this.content.user); },
    roleOptions() {
      const src = this.asArray(this.content.roleOptions);
      if (!src.length) return [{ label: "3rd Party Vendor", value: "3rd Party Vendor" }, { label: "Service Partner", value: "Service Partner" }];
      const lk = this.content.roleLabelField || "label";
      const vk = this.content.roleValueField || "value";
      return src.map((o) => (o && typeof o === "object"
        ? { label: String(o[lk] != null ? o[lk] : (o.name || o.label || o.role || o.title || o.value || "")), value: o[vk] != null ? o[vk] : (o.value != null ? o.value : (o.id != null ? o.id : (o.name || o.role || o.label))) }
        : { label: String(o), value: o }));
    },
    // ---- editor detection ----
    // In the WeWeb editor, firing trigger-events on click throws in the editor's
    // event system; guard every emit with this so clicks are inert while editing.
    isEditing() {
      /* wwEditor:start */
      const s = this.wwEditorState;
      return !!(s && (s.isEditing || s.editMode === "EDITION" || s.editMode === true));
      /* wwEditor:end */
      // eslint-disable-next-line no-unreachable
      return false;
    },
    // ---- theming ----
    svgAttrs() { return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }; },
    themeClass() {
      const m = this.content.darkMode || "auto";
      return { "vd-auto": m === "auto", "vd-dark": m === "dark", "vd-light": m === "light" };
    },
    rootStyle() {
      return {
        "--vd-primary": this.content.primaryColor || "#2563eb",
        "--vd-accent": this.content.accentColor || "#6366f1",
        "--vd-radius": (this.content.radius != null ? this.content.radius : 14) + "px",
      };
    },
  },
  methods: {
    ic(name) { return ICONS[name] || ""; },
    // ---- generic data helpers ----
    asArray(raw) {
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) return raw.data;
        if (Array.isArray(raw.items)) return raw.items;
      }
      return [];
    },
    firstOf(raw) {
      if (Array.isArray(raw)) return raw[0] || {};
      if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) return raw.data[0] || {};
        return raw;
      }
      return {};
    },
    rowVal(row, keys) {
      if (!row || typeof row !== "object") return "";
      for (const k of keys) if (row[k] != null && row[k] !== "") return row[k];
      return "";
    },
    vendorField(k) { const v = this.vendor; return v && v[k] != null ? v[k] : ""; },
    userField(k) { const v = this.userObj; return v && v[k] != null ? v[k] : ""; },
    imgUrl(v) {
      if (Array.isArray(v)) v = v[0];
      if (v && typeof v === "object") return v.url || v.src || (v.thumbnails && v.thumbnails.small && v.thumbnails.small.url) || "";
      return v || "";
    },
    initials(name) { return (name || "").toString().split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase(); },
    money(n) {
      if (n == null || n === "") return "—";
      if (typeof n === "string" && isNaN(Number(n))) return n;
      try { return new Intl.NumberFormat("en-US", { style: "currency", currency: this.content.currency || "USD", minimumFractionDigits: 2 }).format(Number(n)); } catch (e) { return String(n); }
    },
    fmtDate(raw) {
      if (!raw) return "—";
      const d = this.parseDate(raw);
      if (!d || isNaN(d)) return String(raw);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },
    // Parse date-only strings (YYYY-MM-DD) as LOCAL midnight so they don't shift
    // a day in timezones behind UTC; everything else through the native parser.
    parseDate(raw) {
      if (raw instanceof Date) return raw;
      const s = String(raw);
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return new Date(s);
    },
    fmtDateTime(raw) {
      if (!raw) return "";
      const d = new Date(raw);
      if (isNaN(d)) return String(raw);
      return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    },
    prettyStatus(s) { return String(s == null ? "" : s).replace(/[_-]+/g, " ").trim(); },
    statusKey(status) {
      const s = (status || "").toString().toLowerCase();
      if (s.includes("progress") || s.includes("review")) return "warning";
      if (s.includes("verif") || s.includes("approv") || s.includes("paid") || s.includes("complete") || s.includes("active") || s.includes("resolved") || s.includes("submitted")) return "success";
      if (s.includes("declin") || s.includes("cancel") || s.includes("overdue") || s.includes("reject") || s.includes("expired") || s.includes("terminat") || s.includes("inactive")) return "danger";
      if (s.includes("schedul") || s.includes("draft") || s.includes("pend") || s.includes("open") || s.includes("new") || s.includes("request")) return "info";
      return "slate";
    },
    priorityKey(p) {
      const s = (p || "").toString().toLowerCase();
      if (s.includes("urgent") || s.includes("high") || s.includes("critical")) return "danger";
      if (s.includes("medium") || s.includes("normal")) return "warning";
      if (s.includes("low")) return "info";
      return "slate";
    },
    obTone(it) {
      const s = this.rowVal(it, ["status"]).toString().toLowerCase();
      if (s.includes("submit") && !s.includes("not")) return "success";
      if (s.includes("approv") || s.includes("verif") || s.includes("complete")) return "success";
      if (s.includes("reject") || s.includes("declin")) return "danger";
      if (s.includes("pend") || s.includes("review")) return "warning";
      return "danger";
    },
    isVerified(ins) { return this.rowVal(ins, ["status"]).toString().toLowerCase() === "verified" || !!this.rowVal(ins, ["verified_at"]); },
    isExpired(ins) {
      if (this.rowVal(ins, ["status"]).toString().toLowerCase() === "expired") return true;
      const exp = this.rowVal(ins, ["expiration_date"]);
      if (!exp) return false;
      const d = new Date(exp);
      return !isNaN(d) && d < new Date();
    },
    truthyActive(v) {
      if (typeof v === "boolean") return v;
      const s = (v || "").toString().toLowerCase();
      return s === "active" || s === "true" || s === "1" || s === "yes";
    },
    // ---- event dispatch (guarded for the editor) ----
    fireEvent(name, event) {
      if (this.isEditing) return;
      this.$emit("trigger-event", { name, event: event || {} });
    },
    // ---- tabs / header ----
    selectTab(key) { this.activeTab = key; this.fireEvent("tabChange", { tab: key }); },
    emit(name) { this.fireEvent(name, {}); },
    act(name) { this.menuOpen = false; this.fireEvent(name, { id: this.vendorField("id") }); },
    emitStage(st, i) { this.fireEvent("stageClick", { value: st.value, label: st.label, index: i }); },
    emitItem(name, index, item) {
      this.fireEvent(name, { index, id: (item && (item.id != null ? item.id : item.airtable_id)) || "", item: item || {} });
    },
    // ---- details inline edit ----
    optionsFor(f) {
      let src = f.options;
      if ((!src || !src.length) && f.optionsProp) src = this.content[f.optionsProp];
      const list = this.asArray(src);
      // Which keys hold the label and the stored value. Per-field settings win,
      // then the global props, then sensible fallbacks. Defaults to airtable_id
      // for the value so Airtable-synced option collections match stored ids.
      const lk = f.optionLabel || this.content.optionLabelField || "label";
      const vk = f.optionValue || this.content.optionValueField || "airtable_id";
      const mapped = list.map((o) => {
        if (o && typeof o === "object") {
          const label = o[lk] != null && o[lk] !== "" ? o[lk] : (o.label || o.name || o.title || o.value || "");
          const value = o[vk] != null && o[vk] !== "" ? o[vk] : (o.airtable_id != null ? o.airtable_id : (o.id != null ? o.id : label));
          // Carry both ids so the fieldEdit event can hand back whichever the
          // caller needs (Airtable id vs Supabase uuid).
          const id = o.id != null && o.id !== "" ? o.id : "";
          const airtableId = o.airtable_id != null && o.airtable_id !== "" ? o.airtable_id : "";
          return { label: String(label), value, id, airtableId };
        }
        return { label: String(o), value: o, id: o, airtableId: "" };
      });
      return mapped;
    },
    // Options filtered by the tag-picker search box.
    filteredOptions(f) {
      const q = String(this.tagQuery || "").toLowerCase().trim();
      const list = this.optionsFor(f);
      if (!q) return list;
      return list.filter((o) => String(o.label).toLowerCase().indexOf(q) !== -1);
    },
    displayValue(f) {
      const v = this.vendorField(f.key);
      if (v == null || v === "") return "";
      if (f.type === "date") return this.fmtDate(v);
      if (f.type === "select") {
        const opt = this.optionsFor(f).find((o) => String(o.value) === String(v));
        return opt ? opt.label : String(v);
      }
      return String(v);
    },
    displayTags(f) {
      const raw = this.vendorField(f.key);
      const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      const opts = this.optionsFor(f);
      return arr.map((v) => {
        const opt = opts.find((o) => String(o.value) === String(v));
        return opt ? opt.label : String(v);
      });
    },
    startEdit(f) {
      this.editingKey = f.key;
      this.tagQuery = "";
      const v = this.vendorField(f.key);
      if (f.type === "tags") {
        this.editArray = Array.isArray(v) ? v.slice() : (v ? [v] : []);
      } else if (f.type === "date") {
        this.editValue = v ? String(v).slice(0, 10) : "";
      } else {
        this.editValue = v == null ? "" : v;
      }
      this.$nextTick(() => {
        const el = this.$refs.editor;
        const node = Array.isArray(el) ? el[0] : el;
        if (node && node.focus) { node.focus(); if (node.select) node.select(); }
      });
    },
    cancelEdit() { this.editingKey = null; this.editValue = ""; this.editArray = []; },
    // Highlight only — an explicit save button commits (consistent with tags).
    pickOption(f, opt) { this.editValue = opt.value; },
    toggleTag(opt) {
      const i = this.editArray.findIndex((v) => String(v) === String(opt.value));
      if (i >= 0) this.editArray.splice(i, 1); else this.editArray.push(opt.value);
    },
    saveTags(f) {
      const value = this.editArray.slice();
      this.editingKey = null;
      const opts = this.optionsFor(f);
      const chosen = value.map((v) => opts.find((o) => String(o.value) === String(v)) || { value: v, label: String(v), id: "", airtableId: "" });
      const valueLabel = chosen.map((o) => o.label);
      const ids = chosen.map((o) => o.id);
      const airtableIds = chosen.map((o) => o.airtableId);
      this.fireEvent("fieldEdit", {
        key: f.key, label: f.label, value, valueLabel, ids, airtableIds,
        options: chosen.map((o) => ({ value: o.value, label: o.label, id: o.id, airtable_id: o.airtableId })),
        type: "tags", patch: { [f.key]: value },
      });
    },
    saveEdit(f) {
      const value = this.editValue;
      this.editingKey = null;
      let valueLabel = value, id = "", airtableId = "";
      if (f.type === "select") {
        const opt = this.optionsFor(f).find((o) => String(o.value) === String(value));
        if (opt) { valueLabel = opt.label; id = opt.id; airtableId = opt.airtableId; }
      }
      this.fireEvent("fieldEdit", { key: f.key, label: f.label, value, valueLabel, id, airtableId, type: f.type, patch: { [f.key]: value } });
    },
    // ---- activity feed field resolution ----
    authorName(f) { if (!f) return ""; return f.author || (f.user_id && f.user_id.name) || (f.user && f.user.name) || f.name || ""; },
    avatarUrl(f) { if (!f) return ""; return this.imgUrl(f.avatar || (f.user_id && f.user_id.headshot) || (f.user && f.user.headshot) || f.headshot); },
    timeText(f) {
      if (!f) return "";
      if (f.time) return f.time;
      const raw = f.created_at || f.createdAt || f.date;
      return raw ? this.fmtDateTime(raw) : "";
    },
    activityLabel(f) { return (f && (f.activity || f.action)) || ""; },
    bodyText(f) { if (!f) return ""; return f.text || f.description || ""; },
    stripHtml(s) { return String(s == null ? "" : s).replace(/<[^>]*>/g, "").trim(); },
    attachmentsOf(f) { return f && Array.isArray(f.attachments) ? f.attachments : []; },
    isImage(att) {
      if (!att) return false;
      const ct = (att.content_type || att.contentType || att.type || "").toLowerCase();
      if (ct) return ct.indexOf("image/") === 0;
      const u = (att.url || att || "").toString().toLowerCase();
      return /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/.test(u);
    },
    attThumb(att) { return att ? (att.thumbnail_url || att.thumbnailUrl || att.url || "") : ""; },
    attName(att) {
      if (!att) return "File";
      if (att.name || att.filename) return att.name || att.filename;
      const ct = att.content_type || att.contentType || att.type || "";
      const sub = ct.split("/")[1];
      if (sub) return sub.toUpperCase();
      const u = (att.url || "").toString().split("?")[0];
      return u.substring(u.lastIndexOf("/") + 1) || "File";
    },
    canDelete(f) {
      if (this.content.showDelete === false) return false;
      const raw = this.content.deletableActivities;
      const allow = Array.isArray(raw) ? raw : ["Message", "Note added"];
      if (allow.length) {
        const act = String((f && (f.activity || f.action)) || "").trim().toLowerCase();
        return allow.some((a) => String(a).trim().toLowerCase() === act);
      }
      return true;
    },
    emitActivityDelete(i, f) { this.fireEvent("activityDelete", { index: i, id: (f && f.id) != null ? f.id : "" }); },
    emitAtt(i, j, att) {
      this.fireEvent("activityAttachmentClick", { feedIndex: i, attachmentIndex: j, url: (att && att.url) || "", isImage: this.isImage(att), attachment: att || null });
    },
    // ---- composer ----
    onComposerFocus() { this.composerOpen = true; },
    onComposerInput() { this.refreshComposerState(); this.detectMention(); },
    onComposerKeyup(e) { if (this.mentionOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) return; this.detectMention(); },
    refreshComposerState() {
      const el = this.$refs.composer;
      if (!el) return;
      this.mentionCount = el.querySelectorAll(".pp-mention").length;
      this.composerEmpty = el.textContent.replace(/ /g, " ").trim() === "" && this.mentionCount === 0;
    },
    onPaste(e) {
      e.preventDefault();
      const cd = e.clipboardData || window.clipboardData;
      const text = cd && cd.getData ? cd.getData("text/plain") : "";
      if (text) document.execCommand("insertText", false, text);
      this.refreshComposerState();
    },
    onComposerKeydown(e) {
      if (this.mentionOpen && this.filteredMentionUsers.length) {
        if (e.key === "ArrowDown") { e.preventDefault(); this.mentionIndex = Math.min(this.mentionIndex + 1, this.filteredMentionUsers.length - 1); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); this.mentionIndex = Math.max(this.mentionIndex - 1, 0); return; }
        if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); this.insertMention(this.filteredMentionUsers[this.mentionIndex] || this.filteredMentionUsers[0]); return; }
      }
      if (this.mentionOpen && e.key === "Escape") { e.preventDefault(); this.closeMention(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); this.submitNote(); }
    },
    detectMention() {
      const el = this.$refs.composer;
      const sel = typeof window !== "undefined" ? window.getSelection() : null;
      if (!el || !sel || !sel.rangeCount) { this.closeMention(); return; }
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType !== 3 || !el.contains(node)) { this.closeMention(); return; }
      const before = node.textContent.slice(0, range.startOffset);
      const m = /(^|\s| )@([^\s@ ]*)$/.exec(before);
      if (!m) { this.closeMention(); return; }
      const query = m[2];
      if (query !== this.mentionQuery) this.mentionIndex = 0;
      this.mentionQuery = query;
      this.mentionRange = { node, start: range.startOffset - query.length - 1, end: range.startOffset };
      this.mentionOpen = true;
    },
    closeMention() { this.mentionOpen = false; this.mentionQuery = ""; this.mentionRange = null; },
    insertMention(user) {
      const el = this.$refs.composer;
      if (!el || !this.mentionRange) { this.closeMention(); return; }
      const { node, start, end } = this.mentionRange;
      let range;
      try { range = document.createRange(); range.setStart(node, start); range.setEnd(node, end); range.deleteContents(); } catch (e) { this.closeMention(); return; }
      const pill = document.createElement("span");
      pill.className = "pp-mention";
      pill.setAttribute("contenteditable", "false");
      pill.setAttribute("data-id", user.id != null ? String(user.id) : "");
      pill.setAttribute("data-name", user.name);
      pill.textContent = "@" + user.name;
      range.insertNode(pill);
      const space = document.createTextNode(" ");
      if (pill.parentNode) pill.parentNode.insertBefore(space, pill.nextSibling);
      const sel = window.getSelection();
      const after = document.createRange();
      after.setStart(space, 1); after.collapse(true);
      sel.removeAllRanges(); sel.addRange(after);
      el.focus();
      this.closeMention();
      this.refreshComposerState();
    },
    serialize() {
      const el = this.$refs.composer;
      const mentions = [];
      const seen = {};
      let text = "";
      const walk = (nodes) => {
        nodes.forEach((n) => {
          if (n.nodeType === 3) { text += n.textContent; return; }
          if (n.nodeType !== 1) return;
          if (n.classList && n.classList.contains("pp-mention")) {
            const id = n.getAttribute("data-id") || "";
            const name = n.getAttribute("data-name") || n.textContent.replace(/^@/, "");
            const key = id || name;
            if (!seen[key]) { seen[key] = true; mentions.push({ id, name }); }
            text += "@" + name;
            return;
          }
          if (n.tagName === "BR") { text += "\n"; return; }
          walk(Array.from(n.childNodes));
          if (/^(DIV|P)$/.test(n.tagName)) text += "\n";
        });
      };
      if (el) walk(Array.from(el.childNodes));
      return { text: text.replace(/ /g, " ").replace(/\n{3,}/g, "\n\n").trim(), mentions, html: el ? el.innerHTML : "" };
    },
    triggerFile() { if (this.$refs.file) this.$refs.file.click(); },
    onFileInput(e) { this.addFiles(e.target.files); e.target.value = ""; },
    onDrop(e) { this.dragActive = false; this.addFiles(e.dataTransfer && e.dataTransfer.files); },
    addFiles(fileList) {
      Array.from(fileList || []).forEach((file) => {
        const isImg = (file.type || "").indexOf("image/") === 0;
        this.attachments.push({ file, name: file.name, size: file.size, type: file.type, isImage: isImg, url: isImg ? URL.createObjectURL(file) : "" });
      });
      this.composerOpen = true;
    },
    removeAttachment(i) {
      const a = this.attachments[i];
      if (a && a.url) try { URL.revokeObjectURL(a.url); } catch (e) {}
      this.attachments.splice(i, 1);
    },
    submitNote() {
      const { text, mentions, html } = this.serialize();
      if (!text && !this.attachments.length) return;
      this.fireEvent("noteSubmit", { text, html, mentions, mentionIds: mentions.map((m) => m.id), files: this.attachments.map((a) => a.file), attachments: this.attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })) });
      this.resetComposer();
    },
    cancelComposer() { this.resetComposer(); },
    resetComposer() {
      if (this.$refs.composer) this.$refs.composer.innerHTML = "";
      this.attachments.forEach((a) => { if (a.url) try { URL.revokeObjectURL(a.url); } catch (e) {} });
      this.attachments = [];
      this.mentionCount = 0;
      this.composerEmpty = true;
      this.composerOpen = false;
      this.closeMention();
    },
    // ---- user ----
    syncUserState() {
      this.localUserActive = this.truthyActive(this.userField("status") || this.userField("active"));
      this.localRole = this.currentRoleValue();
    },
    currentRoleValue() {
      const v = this.userField("role") || this.userField("app_role");
      if (v === "" || v == null) return this.roleOptions[0] ? this.roleOptions[0].value : "";
      return v;
    },
    changeRole(value) {
      this.localRole = value;
      const opt = this.roleOptions.find((o) => String(o.value) === String(value));
      this.fireEvent("roleChange", { value, label: opt ? opt.label : value, id: this.userField("id") || this.userField("user_auth_id") });
    },
    toggleUserActive() {
      const cur = this.localUserActive;
      this.localUserActive = !cur;
      this.fireEvent("toggleUserActive", { active: cur, next: !cur, value: !cur, id: this.userField("id") || this.userField("user_auth_id") });
    },
  },
};
</script>

<style lang="scss" scoped>
.vd-root {
  --surface: #ffffff; --surface-2: #f7f9fc; --surface-3: #eef2f7; --border: #e4e9f0; --border-strong: #d4dbe6;
  --text: #1f2a37; --text-muted: #64748b; --text-subtle: #94a3b8;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06);
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-pop: 0 12px 32px rgba(16, 24, 40, 0.16);
  --success: #10b981; --warning: #f59e0b; --danger: #ef4444; --info: #3b82f6;
  --primary: var(--vd-primary, #2563eb); --accent: var(--vd-accent, #6366f1); --radius: var(--vd-radius, 14px);
  box-sizing: border-box; width: 100%; max-width: 100%; container-type: inline-size; color: var(--text);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.45;
  display: block;
}
.vd-root *, .vd-root *::before, .vd-root *::after { box-sizing: border-box; }
.vd-inner { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
@mixin dark {
  --surface: #161f30; --surface-2: #1b2638; --surface-3: #202c40; --border: #28344a; --border-strong: #34425c;
  --text: #e8eef7; --text-muted: #94a3b8; --text-subtle: #64748b;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-pop: 0 16px 40px rgba(0, 0, 0, 0.5);
}
.vd-root.vd-dark { @include dark; }
@media (prefers-color-scheme: dark) { .vd-root.vd-auto { @include dark; } }

.vd-svg { display: block; }
.vd-muted { color: var(--text-muted); }
.vd-text--success { color: var(--success); }
.vd-text--danger { color: var(--danger); }
.vd-text--warning { color: var(--warning); }
.vd-text--info { color: var(--info); }

/* ---- cards ---- */
.vd-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: clamp(16px, 2.4vw, 24px); min-width: 0; }
.vd-tabpane { display: flex; flex-direction: column; gap: 16px; }
.vd-card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.vd-card__heading { margin: 0; font-size: 15px; font-weight: 700; color: var(--text); }
.vd-card__heading--lg { font-size: 18px; }
.vd-card__sub { margin: 4px 0 0; color: var(--text-muted); font-size: 13px; }

/* ---- header ---- */
.vd-header { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: clamp(16px, 2.4vw, 22px); }
.vd-header__bar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.vd-iconbtn { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.vd-iconbtn:hover { background: var(--surface-2); color: var(--text); border-color: var(--border-strong); }
.vd-iconbtn .vd-svg { width: 18px; height: 18px; }
.vd-menu { position: relative; }
.vd-menu__pop { position: absolute; top: calc(100% + 6px); right: 0; z-index: 50; min-width: 190px; padding: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-pop); display: flex; flex-direction: column; gap: 2px; }
.vd-menu__pop--left { right: auto; left: 0; }
.vd-menu__item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 9px 11px; border: none; background: none; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13.5px; font-weight: 600; color: var(--text); }
.vd-menu__item:hover { background: var(--surface-2); }
.vd-menu__item .vd-svg { width: 16px; height: 16px; flex: none; color: var(--text-subtle); }
.vd-menu__item--warn { color: var(--warning); } .vd-menu__item--warn .vd-svg { color: var(--warning); }
.vd-menu__item--danger { color: var(--danger); } .vd-menu__item--danger .vd-svg { color: var(--danger); }
.vd-menu__sep { height: 1px; background: var(--border); margin: 4px 0; }

.vd-header__id { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.vd-avatar { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-weight: 700; font-size: 14px; }
.vd-avatar--lg { width: 68px; height: 68px; font-size: 22px; }
.vd-avatar img { width: 100%; height: 100%; object-fit: cover; }
.vd-header__name { margin: 0 0 6px; font-size: clamp(20px, 3vw, 26px); font-weight: 700; color: var(--text); }
.vd-badgerow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vd-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.vd-badge--stage { background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); }

.vd-contactcard { display: flex; flex-wrap: wrap; gap: 8px 22px; padding: 14px clamp(14px, 2vw, 20px); }
.vd-contact { display: inline-flex; align-items: center; gap: 8px; color: var(--info); font-weight: 500; text-decoration: none; font-size: 13.5px; word-break: break-word; }
.vd-contact--static { color: var(--text-muted); }
.vd-contact .vd-svg { width: 16px; height: 16px; flex: none; color: var(--text-subtle); }
.vd-contact:hover:not(.vd-contact--static) { text-decoration: underline; }

/* ---- tabs ---- */
.vd-tabs { display: flex; gap: 4px; padding: 5px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow-x: auto; scrollbar-width: thin; box-shadow: var(--shadow-sm); }
.vd-tabs::-webkit-scrollbar { height: 6px; }
.vd-tabs::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }
.vd-tab { flex: none; display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border: none; background: transparent; border-radius: 10px; color: var(--text-muted); font-size: 13.5px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; transition: background .15s, color .15s; }
.vd-tab:hover { background: var(--surface-3); color: var(--text); }
.vd-tab .vd-svg { width: 16px; height: 16px; }
.vd-tab--active { background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); }

/* ---- buttons ---- */
.vd-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; transition: filter .15s, background .15s, color .15s, border-color .15s; }
.vd-btn .vd-svg { width: 15px; height: 15px; }
.vd-btn:hover { background: var(--surface-2); border-color: var(--border-strong); }
.vd-btn--sm { padding: 6px 12px; font-size: 12.5px; }
.vd-btn--primary { background: var(--primary); color: #fff; border-color: transparent; box-shadow: 0 6px 16px color-mix(in srgb, var(--primary) 30%, transparent); }
.vd-btn--primary:hover { filter: brightness(1.06); background: var(--primary); }
.vd-btn--primary:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
.vd-btn--ghost { background: transparent; color: var(--text-muted); }
.vd-btn--ghost:hover { background: var(--surface-2); color: var(--text); }

/* ---- pills ---- */
.vd-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; background: var(--surface-3); color: var(--text-muted); white-space: nowrap; }
.vd-pill__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.vd-pill--warning { background: color-mix(in srgb, var(--warning) 14%, transparent); color: var(--warning); }
.vd-pill--success { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
.vd-pill--danger  { background: color-mix(in srgb, var(--danger) 14%, transparent);  color: var(--danger); }
.vd-pill--info    { background: color-mix(in srgb, var(--info) 14%, transparent);    color: var(--info); }
.vd-pill--slate   { background: var(--surface-3); color: var(--text-muted); }

/* ---- onboarding pipeline ---- */
.vd-pipeline { display: flex; gap: 6px; overflow-x: auto; padding: 8px 2px 4px; scrollbar-width: thin; }
.vd-stage { flex: 1 0 auto; min-width: 96px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 8px 6px; border: none; background: none; cursor: pointer; font-family: inherit; position: relative; }
.vd-stage::after { content: ""; position: absolute; top: 22px; left: calc(50% + 20px); right: calc(-50% + 20px); height: 2px; background: var(--border); }
.vd-stage:last-child::after { display: none; }
.vd-stage__dot { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 2px solid var(--border-strong); color: var(--text-subtle); font-weight: 700; font-size: 13px; z-index: 1; transition: background .15s, border-color .15s, color .15s; }
.vd-stage__dot .vd-svg { width: 18px; height: 18px; }
.vd-stage__label { font-size: 11.5px; font-weight: 600; color: var(--text-muted); text-align: center; line-height: 1.3; }
.vd-stage--done .vd-stage__dot { background: var(--primary); border-color: var(--primary); color: #fff; }
.vd-stage--done::after { background: var(--primary); }
.vd-stage--current .vd-stage__dot { background: color-mix(in srgb, var(--primary) 14%, transparent); border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent); }
.vd-stage--current .vd-stage__label { color: var(--primary); }
.vd-stage:hover .vd-stage__dot { border-color: var(--primary); }

/* ---- onboarding checklist ---- */
.vd-checklist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.vd-checkitem { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; cursor: pointer; transition: border-color .15s, background .15s; }
.vd-checkitem:hover { border-color: var(--border-strong); background: var(--surface-2); }
.vd-checkitem__icon { flex: none; } .vd-checkitem__icon .vd-svg { width: 20px; height: 20px; }
.vd-checkitem__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.vd-checkitem__title { font-size: 14px; color: var(--text); }
.vd-checkitem__desc { font-size: 12.5px; color: var(--text-muted); }

/* ---- details grid ---- */
.vd-detailgrid { display: grid; grid-template-columns: 1fr; gap: 2px; }
.vd-kv { display: grid; grid-template-columns: 1fr; gap: 4px; padding: 14px 0; border-top: 1px solid var(--border); }
.vd-kv:first-child { border-top: none; }
.vd-kv__label { font-weight: 700; color: var(--text); font-size: 13px; }
.vd-kv__body { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.vd-kv--editing .vd-kv__body { flex-direction: column; align-items: stretch; gap: 8px; }
.vd-kv__value { color: var(--text-muted); flex: 1 1 auto; min-width: 0; word-break: break-word; }
.vd-kv__edit { flex: none; display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 7px; border: none; background: none; color: var(--text-subtle); cursor: pointer; opacity: .4; transition: opacity .15s, background .15s, color .15s; }
.vd-kv:hover .vd-kv__edit { opacity: 1; }
.vd-kv__edit:hover { background: var(--surface-2); color: var(--primary); }
.vd-kv__edit .vd-svg { width: 15px; height: 15px; }

.vd-tags { display: flex; flex-wrap: wrap; gap: 6px; flex: 1 1 auto; }
.vd-tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); }

/* inputs */
.vd-input { width: 100%; padding: 9px 11px; border-radius: 9px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); font-size: 13.5px; font-family: inherit; outline: none; transition: border-color .15s, box-shadow .15s; }
.vd-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
.vd-input--area { resize: vertical; min-height: 64px; line-height: 1.5; }
.vd-editactions { display: flex; gap: 6px; justify-content: flex-end; }
.vd-iconbtn2 { display: inline-grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, filter .15s; }
.vd-iconbtn2:hover { background: var(--surface-2); }
.vd-iconbtn2:disabled { opacity: .45; cursor: not-allowed; }
.vd-iconbtn2 .vd-svg { width: 16px; height: 16px; }
.vd-iconbtn2--save { color: #fff; background: var(--primary); border-color: var(--primary); }
.vd-iconbtn2--save:hover { filter: brightness(1.06); }

.vd-optionlist { display: flex; flex-direction: column; gap: 2px; max-height: 260px; overflow-y: auto; padding: 6px; border: 1px solid var(--border-strong); border-radius: 10px; background: var(--surface); }
.vd-optionlist__item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 8px 10px; border: none; background: none; border-radius: 8px; cursor: pointer; font: inherit; color: var(--text); }
.vd-optionlist__item:hover { background: var(--surface-2); }
.vd-optionlist__item--active { background: color-mix(in srgb, var(--primary) 12%, transparent); }
.vd-optionlist__label { flex: 1 1 auto; font-size: 13.5px; font-weight: 600; min-width: 0; word-break: break-word; }
.vd-optionlist__check { width: 16px; height: 16px; color: var(--primary); flex: none; }
.vd-optionlist__empty { padding: 12px; font-size: 12.5px; color: var(--text-subtle); text-align: center; }

.vd-tagsearch { margin-bottom: 8px; }
.vd-tagpicker { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1px solid var(--border-strong); border-radius: 10px; background: var(--surface); max-height: 200px; overflow-y: auto; }
.vd-tagopt { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s, color .15s, border-color .15s; }
.vd-tagopt .vd-svg { width: 13px; height: 13px; }
.vd-tagopt:hover { border-color: var(--border-strong); color: var(--text); }
.vd-tagopt--on { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); border-color: color-mix(in srgb, var(--accent) 30%, transparent); }

.vd-select { width: 100%; padding: 9px 11px; border-radius: 9px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); font-size: 13.5px; font-family: inherit; outline: none; cursor: pointer; }
.vd-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }

/* ---- box ---- */
.vd-boxframe { position: relative; width: 100%; height: 70vh; min-height: 480px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
.vd-boxframe iframe { width: 100%; height: 100%; border: 0; display: block; }

/* ---- tables ---- */
.vd-table__wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
.vd-table { width: 100%; border-collapse: collapse; min-width: 560px; }
.vd-table thead th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: var(--text-muted); background: var(--surface-2); border-bottom: 1px solid var(--border); white-space: nowrap; }
.vd-table thead th.vd-num { text-align: right; }
.vd-table tbody td { padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
.vd-table tbody tr { cursor: pointer; }
.vd-table tbody tr:last-child td { border-bottom: none; }
.vd-table tbody tr:hover { background: var(--surface-2); }
.vd-num { text-align: right; } .vd-num--strong { font-weight: 700; }

/* ---- insurance cards (grid) ---- */
.vd-insgrid { display: grid; grid-template-columns: 1fr; gap: 14px; }
.vd-inscard { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: var(--surface); transition: border-color .15s, box-shadow .15s; }
.vd-inscard:hover { border-color: var(--border-strong); box-shadow: var(--shadow-sm); }
.vd-inscard__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.vd-inscard__title { display: flex; align-items: center; gap: 11px; min-width: 0; }
.vd-inscard__icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); flex: none; }
.vd-inscard__icon .vd-svg { width: 20px; height: 20px; }
.vd-inscard__titletext { min-width: 0; }
.vd-inscard__title strong { display: block; font-size: 14px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vd-inscard__sub { display: block; font-size: 12.5px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vd-inscard__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 14px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.vd-mini { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.vd-mini__label { font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; color: var(--text-subtle); font-weight: 700; }
.vd-mini__value { font-size: 13px; color: var(--text); font-weight: 600; word-break: break-word; }
.vd-inscard__foot { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 14px; }
.vd-inscard__spacer { flex: 1; }
.vd-verified { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--success); }
.vd-verified .vd-svg { width: 16px; height: 16px; }
.vd-rowactions { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-end; }

/* ---- reviews coming soon ---- */
.vd-comingsoon { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 16px; text-align: center; }
.vd-comingsoon__icon { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 16px; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); }
.vd-comingsoon__icon .vd-svg { width: 28px; height: 28px; }

/* ---- user tab ---- */
.vd-usercard__head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 16px; margin-bottom: 8px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.vd-usercard__id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.vd-usercard__name { display: block; font-size: 15px; color: var(--text); }
.vd-usercard__email { font-size: 12.5px; color: var(--text-muted); }
.vd-usercard__actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.vd-toggle { display: inline-flex; align-items: center; gap: 8px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 700; color: var(--text-muted); }
.vd-toggle__track { position: relative; width: 40px; height: 22px; border-radius: 999px; background: var(--border-strong); transition: background .15s; }
.vd-toggle__thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-sm); transition: transform .15s; }
.vd-toggle--on .vd-toggle__track { background: var(--success); }
.vd-toggle--on .vd-toggle__thumb { transform: translateX(18px); }
.vd-toggle--on { color: var(--success); }

/* ---- empty ---- */
.vd-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 16px; color: var(--text-subtle); }
.vd-empty .vd-svg { width: 34px; height: 34px; }

/* ---- feed (activity) ---- */
.pp-composer { display: flex; gap: 14px; margin-bottom: 20px; }
.pp-composer__main { flex: 1; min-width: 0; }
.pp-composer__inputwrap { position: relative; }
.pp-composer__input { min-height: 44px; padding: 11px 14px; border: 1px solid var(--border-strong); border-radius: 12px; background: var(--surface); color: var(--text); font-size: 13.5px; line-height: 1.55; outline: none; white-space: pre-wrap; overflow-wrap: anywhere; transition: border-color .15s, box-shadow .15s; }
.pp-composer--active .pp-composer__input { min-height: 76px; }
.pp-composer__input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 16%, transparent); }
.pp-composer__input:empty::before { content: attr(data-placeholder); color: var(--text-subtle); pointer-events: none; }
.pp-composer__input :deep(.pp-mention) { display: inline; padding: 1px 6px; margin: 0 1px; border-radius: 6px; font-weight: 600; color: var(--info); background: color-mix(in srgb, var(--info) 12%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--info) 40%, transparent); white-space: nowrap; }
.pp-mentionmenu { position: absolute; top: calc(100% + 6px); left: 0; z-index: 40; width: min(320px, 100%); max-height: 264px; overflow-y: auto; padding: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow-pop); display: flex; flex-direction: column; gap: 2px; }
.pp-mentionitem { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; padding: 8px 10px; border: none; background: none; border-radius: 8px; cursor: pointer; font: inherit; color: var(--text); }
.pp-mentionitem:hover, .pp-mentionitem--active { background: var(--surface-2); }
.pp-mentionitem__avatar { flex: none; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-size: 11px; font-weight: 700; }
.pp-mentionitem__avatar img { width: 100%; height: 100%; object-fit: cover; }
.pp-mentionitem__name { flex: 0 1 auto; font-size: 13.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-mentionmenu__empty { padding: 12px; font-size: 12.5px; color: var(--text-subtle); text-align: center; }
.pp-composer__foot { margin-top: 10px; }
.pp-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 18px; border: 1.5px dashed color-mix(in srgb, var(--primary) 45%, var(--border-strong)); border-radius: 12px; background: color-mix(in srgb, var(--primary) 5%, transparent); color: var(--text-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; text-align: center; transition: border-color .15s, background .15s; }
.pp-drop:hover, .pp-drop--over { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }
.pp-drop .vd-svg { width: 22px; height: 22px; color: var(--primary); }
.pp-drop__input { display: none; }
.pp-attpreview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pp-attchip { position: relative; }
.pp-attchip--img { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); }
.pp-attchip--img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-attchip--file { display: inline-flex; align-items: center; gap: 7px; max-width: 220px; padding: 8px 28px 8px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; }
.pp-attchip--file .vd-svg { width: 15px; height: 15px; flex: none; color: var(--danger); }
.pp-attchip__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-attchip__x { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; border: none; background: var(--text); color: var(--surface); cursor: pointer; box-shadow: var(--shadow-sm); }
.pp-attchip__x .vd-svg { width: 12px; height: 12px; }
.pp-attchip--file .pp-attchip__x { top: 50%; right: 6px; transform: translateY(-50%); width: 18px; height: 18px; background: transparent; color: var(--text-subtle); box-shadow: none; }
.pp-composer__actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
.pp-composer__spacer { flex: 1; }
.pp-feed { list-style: none; margin: 0; padding: 0; }
.pp-feeditem { display: flex; gap: 14px; padding-bottom: 22px; position: relative; }
.pp-feeditem::before { content: ""; position: absolute; left: 21px; top: 48px; bottom: 0; width: 2px; background: var(--border); }
.pp-feeditem--last::before { display: none; }
.pp-feeditem .vd-avatar { cursor: pointer; z-index: 1; }
.pp-feeditem__body { flex: 1; min-width: 0; }
.pp-feeditem__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.pp-feeditem__del { flex: none; display: grid; place-items: center; width: 28px; height: 28px; border: none; background: transparent; border-radius: 8px; color: var(--text-subtle); cursor: pointer; transition: background .15s, color .15s; }
.pp-feeditem__del:hover { background: color-mix(in srgb, var(--danger) 12%, transparent); color: var(--danger); }
.pp-feeditem__del .vd-svg { width: 16px; height: 16px; }
.pp-feeditem__head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; cursor: pointer; flex-wrap: wrap; min-width: 0; }
.pp-feeditem__head strong { color: var(--text); font-size: 13.5px; }
.pp-feeditem__head .vd-muted { font-size: 12px; }
.pp-feeditem__activity { color: var(--text); font-weight: 600; font-size: 13.5px; }
.pp-feeditem__text { margin: 0; color: var(--text-muted); font-size: 13.5px; overflow-wrap: anywhere; }
.pp-feeditem__text :deep(p) { margin: 0; } .pp-feeditem__text :deep(p + p) { margin-top: 6px; }
.pp-feeditem__text :deep(a) { color: var(--info); }
.pp-atts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pp-att { text-decoration: none; cursor: pointer; font-family: inherit; padding: 0; border: none; background: none; }
.pp-att--img { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 9px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-subtle); }
.pp-att--img img { width: 100%; height: 100%; object-fit: cover; }
.pp-att--img .vd-svg { width: 22px; height: 22px; }
.pp-att--file { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; min-width: 0; padding: 8px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; }
.pp-att--file:hover { border-color: var(--border-strong); color: var(--text); }
.pp-att--file .vd-svg { width: 15px; height: 15px; flex: none; color: var(--danger); }
.pp-att__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---- responsive ---- */
@container (min-width: 620px) {
  .vd-detailgrid { grid-template-columns: 1fr 1fr; gap: 2px 28px; }
  .vd-kv--wide { grid-column: 1 / -1; }
  .vd-insgrid { grid-template-columns: repeat(2, 1fr); }
}
@container (min-width: 1000px) {
  .vd-insgrid { grid-template-columns: repeat(3, 1fr); }
}
@supports not (container-type: inline-size) {
  @media (min-width: 620px) {
    .vd-detailgrid { grid-template-columns: 1fr 1fr; gap: 2px 28px; }
    .vd-kv--wide { grid-column: 1 / -1; }
    .vd-insgrid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1000px) { .vd-insgrid { grid-template-columns: repeat(3, 1fr); } }
}
</style>
